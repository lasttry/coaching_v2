import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';
import { fetchFpbTeamCalendar } from '@/lib/fpb/fetch';
import { FpbCalendarGame } from '@/types/fpb/calendar/types';
import i18next from '@/lib/i18n.server';

type Params = Promise<{ id: string }>;

/** What the preview returns for each game found on the FPB calendar. */
interface ImportPlanEntry {
  fpbGameId: number | null;
  date: string | null;
  dateText: string;
  timeText: string;
  homeTeamName: string;
  awayTeamName: string;
  opponentName: string;
  competitionLabel: string | null;
  echelonLabel: string | null;
  venueName: string;
  away: boolean;
  /** suggested opponent match from our DB, or null if none */
  suggestedOpponentId: number | null;
  /** suggested competition match from our DB, or null if none */
  suggestedCompetitionId: number | null;
  action: 'create' | 'skip-existing' | 'skip-date' | 'skip-own-team';
  reason?: string;
}

function normalize(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function isOurTeam(name: string, ownNames: string[]): boolean {
  const n = normalize(name);
  if (!n) return false;
  for (const own of ownNames) {
    const o = normalize(own);
    if (!o) continue;
    if (n === o || n.startsWith(o) || o.startsWith(n) || n.includes(o) || o.includes(n)) {
      return true;
    }
  }
  return false;
}

function findBestOpponentId(
  name: string,
  opponents: { id: number; name: string; shortName: string }[]
): number | null {
  const n = normalize(name);
  if (!n) return null;
  // exact normalized match first
  const exact = opponents.find((o) => normalize(o.name) === n || normalize(o.shortName) === n);
  if (exact) return exact.id;
  // contains fallback (either way)
  const partial = opponents.find((o) => {
    const on = normalize(o.name);
    return on && (on.includes(n) || n.includes(on));
  });
  return partial?.id ?? null;
}

function findBestCompetitionId(
  label: string | null,
  competitions: { id: number; name: string }[]
): number | null {
  if (!label) return null;
  const n = normalize(label);
  if (!n) return null;
  const exact = competitions.find((c) => normalize(c.name) === n);
  if (exact) return exact.id;
  const partial = competitions.find((c) => {
    const cn = normalize(c.name);
    return cn && (cn.includes(n) || n.includes(cn));
  });
  return partial?.id ?? null;
}

async function buildImportPlan(
  clubId: number,
  calendar: FpbCalendarGame[]
): Promise<ImportPlanEntry[]> {
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { name: true, shortName: true },
  });
  const ownNames = [club?.name, club?.shortName].filter((x): x is string => !!x);

  const [opponents, competitions] = await Promise.all([
    prisma.opponent.findMany({ select: { id: true, name: true, shortName: true } }),
    prisma.competition.findMany({ select: { id: true, name: true } }),
  ]);

  const existingFpbIds = new Set(
    (
      await prisma.game.findMany({
        where: {
          fpbGameId: { in: calendar.map((c) => c.fpbGameId).filter((v): v is number => !!v) },
        },
        select: { fpbGameId: true },
      })
    )
      .map((g) => g.fpbGameId)
      .filter((v): v is number => !!v)
  );

  return calendar.map<ImportPlanEntry>((game) => {
    const baseFields = {
      fpbGameId: game.fpbGameId,
      date: game.date ? game.date.toISOString() : null,
      dateText: game.dateText,
      timeText: game.timeText,
      homeTeamName: game.homeTeamName,
      awayTeamName: game.awayTeamName,
      competitionLabel: game.competitionLabel,
      echelonLabel: game.echelonLabel,
      venueName: game.venueName,
    };

    if (!game.date) {
      return {
        ...baseFields,
        opponentName: '',
        away: false,
        suggestedOpponentId: null,
        suggestedCompetitionId: null,
        action: 'skip-date',
        reason: 'Invalid or unparseable date',
      };
    }

    const homeIsUs = isOurTeam(game.homeTeamName, ownNames);
    const awayIsUs = isOurTeam(game.awayTeamName, ownNames);

    let away: boolean | null = null;
    let opponentName = '';
    if (homeIsUs && !awayIsUs) {
      away = false;
      opponentName = game.awayTeamName;
    } else if (!homeIsUs && awayIsUs) {
      away = true;
      opponentName = game.homeTeamName;
    } else if (homeIsUs && awayIsUs) {
      away = false;
      opponentName = game.awayTeamName;
    }

    if (away === null) {
      return {
        ...baseFields,
        opponentName: '',
        away: false,
        suggestedOpponentId: null,
        suggestedCompetitionId: null,
        action: 'skip-own-team',
        reason: 'Could not determine which team belongs to this club',
      };
    }

    if (game.fpbGameId && existingFpbIds.has(game.fpbGameId)) {
      return {
        ...baseFields,
        opponentName,
        away,
        suggestedOpponentId: findBestOpponentId(opponentName, opponents),
        suggestedCompetitionId: findBestCompetitionId(game.competitionLabel, competitions),
        action: 'skip-existing',
        reason: 'Game already imported',
      };
    }

    return {
      ...baseFields,
      opponentName,
      away,
      suggestedOpponentId: findBestOpponentId(opponentName, opponents),
      suggestedCompetitionId: findBestCompetitionId(game.competitionLabel, competitions),
      action: 'create',
    };
  });
}

async function findOrCreateVenueByName(
  name: string,
  away: boolean,
  clubId: number,
  opponentId: number
): Promise<number | null> {
  if (!name) return null;
  const trimmed = name.trim().slice(0, 50);
  const normalized = normalize(trimmed);

  const venues = await prisma.venue.findMany({ select: { id: true, name: true } });
  const match = venues.find((v) => normalize(v.name) === normalized);
  if (match) return match.id;

  const created = await prisma.venue.create({
    data: {
      name: trimmed,
      ...(away ? { opponentId } : { clubId }),
    },
  });
  return created.id;
}

export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await segmentData.params;
  const teamId = Number(id);
  if (Number.isNaN(teamId)) {
    return NextResponse.json({ error: 'Invalid team id' }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, clubId: true, fpbTeamId: true },
  });
  if (!team) {
    return NextResponse.json({ error: i18next.t('team.fetch.error') }, { status: 404 });
  }
  if (team.clubId !== session.user.selectedClubId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!team.fpbTeamId) {
    return NextResponse.json({ error: i18next.t('fpbImport.missingFpbTeamId') }, { status: 400 });
  }

  try {
    const calendar = await fetchFpbTeamCalendar(team.fpbTeamId);
    const plan = await buildImportPlan(team.clubId, calendar);
    return NextResponse.json({ plan });
  } catch (error) {
    log.error('FPB calendar preview failed:', error);
    return NextResponse.json({ error: i18next.t('fpbImport.fetchError') }, { status: 500 });
  }
}

/** Payload for POST — one entry per game the user decided to import. */
interface ImportGameInput {
  fpbGameId?: number | null;
  date: string;
  away: boolean;
  venueName?: string | null;
  opponentId: number;
  competitionId: number;
  competitionSerieId?: number | null;
}

interface ImportResultEntry {
  fpbGameId: number | null;
  date: string;
  opponentId: number;
  status: 'created' | 'duplicate' | 'error';
  gameId?: number;
  reason?: string;
}

export async function POST(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await segmentData.params;
  const teamId = Number(id);
  if (Number.isNaN(teamId)) {
    return NextResponse.json({ error: 'Invalid team id' }, { status: 400 });
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, clubId: true, fpbTeamId: true },
  });
  if (!team) {
    return NextResponse.json({ error: i18next.t('team.fetch.error') }, { status: 404 });
  }
  if (team.clubId !== session.user.selectedClubId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { games?: ImportGameInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const items = Array.isArray(body.games) ? body.games : [];
  if (items.length === 0) {
    return NextResponse.json({ error: 'No games to import' }, { status: 400 });
  }

  const results: ImportResultEntry[] = [];

  for (const item of items) {
    try {
      if (!item.date || !item.opponentId || !item.competitionId) {
        results.push({
          fpbGameId: item.fpbGameId ?? null,
          date: item.date ?? '',
          opponentId: item.opponentId ?? 0,
          status: 'error',
          reason: 'Missing date, opponent or competition',
        });
        continue;
      }

      // Dedupe by fpbGameId (in case something was imported between preview and submit).
      if (item.fpbGameId) {
        const existing = await prisma.game.findUnique({
          where: { fpbGameId: item.fpbGameId },
          select: { id: true },
        });
        if (existing) {
          results.push({
            fpbGameId: item.fpbGameId,
            date: item.date,
            opponentId: item.opponentId,
            status: 'duplicate',
            gameId: existing.id,
          });
          continue;
        }
      }

      const venueId = await findOrCreateVenueByName(
        item.venueName ?? '',
        item.away,
        team.clubId,
        item.opponentId
      );

      const gameDate = new Date(item.date);
      const created = await prisma.game.create({
        data: {
          clubId: team.clubId,
          teamId: team.id,
          opponentId: item.opponentId,
          competitionId: item.competitionId,
          ...(item.competitionSerieId ? { competitionSerieId: item.competitionSerieId } : {}),
          ...(venueId ? { venueId } : {}),
          date: gameDate,
          away: Boolean(item.away),
          completed: gameDate.getTime() < Date.now(),
          fpbGameId: item.fpbGameId ?? null,
        },
      });

      results.push({
        fpbGameId: item.fpbGameId ?? null,
        date: item.date,
        opponentId: item.opponentId,
        status: 'created',
        gameId: created.id,
      });
    } catch (err) {
      log.error('Failed to import FPB game', err, item);
      results.push({
        fpbGameId: item.fpbGameId ?? null,
        date: item.date,
        opponentId: item.opponentId,
        status: 'error',
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    results,
    counts: {
      created: results.filter((r) => r.status === 'created').length,
      duplicate: results.filter((r) => r.status === 'duplicate').length,
      error: results.filter((r) => r.status === 'error').length,
    },
  });
}
