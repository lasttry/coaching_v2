import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';
import i18next from '@/lib/i18n.server';

interface UpcomingGame {
  id: number;
  date: string;
  away: boolean;
  number: number | null;
  opponent: { id: number; name: string; image: string | null } | null;
  team: { id: number; name: string } | null;
  competition: { id: number; name: string } | null;
  venue: { id: number; name: string } | null;
}

interface UpcomingBirthday {
  id: number;
  name: string;
  number: string | null;
  photo: string | null;
  birthdate: string;
  daysUntil: number;
  turningAge: number;
}

interface ChartPoint {
  label: string;
  value: number;
}

export interface HomeData {
  upcomingGames: UpcomingGame[];
  upcomingBirthdays: UpcomingBirthday[];
  athletesByBirthYear: ChartPoint[];
  totals: {
    athletes: number;
    teams: number;
    upcomingGames: number;
  };
}

const BIRTHDAY_WINDOW_DAYS = 60;
const UPCOMING_GAMES_LIMIT = 10;
const UPCOMING_BIRTHDAYS_LIMIT = 10;

function computeDaysUntilNextBirthday(
  birthdate: Date,
  today: Date
): { daysUntil: number; turningAge: number } {
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();

  let nextBirthdayYear = todayYear;
  if (
    birthdate.getMonth() < todayMonth ||
    (birthdate.getMonth() === todayMonth && birthdate.getDate() < todayDay)
  ) {
    nextBirthdayYear = todayYear + 1;
  }

  const nextBirthday = new Date(nextBirthdayYear, birthdate.getMonth(), birthdate.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  const todayStart = new Date(todayYear, todayMonth, todayDay);
  const daysUntil = Math.round((nextBirthday.getTime() - todayStart.getTime()) / msPerDay);
  const turningAge = nextBirthdayYear - birthdate.getFullYear();
  return { daysUntil, turningAge };
}

export async function GET(req: Request): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const selectedClubId = session.user.selectedClubId ? Number(session.user.selectedClubId) : null;

  if (!selectedClubId || Number.isNaN(selectedClubId)) {
    return NextResponse.json({ error: i18next.t('club.validation.invalidId') }, { status: 400 });
  }

  try {
    const now = new Date();

    const [gamesRaw, athletesRaw, teamsCount, upcomingGamesCount] = await Promise.all([
      prisma.game.findMany({
        where: {
          clubId: selectedClubId,
          date: { gte: now },
        },
        orderBy: { date: 'asc' },
        take: UPCOMING_GAMES_LIMIT,
        select: {
          id: true,
          date: true,
          away: true,
          number: true,
          opponent: { select: { id: true, name: true, image: true } },
          team: { select: { id: true, name: true } },
          competition: { select: { id: true, name: true } },
          venue: { select: { id: true, name: true } },
        },
      }),
      prisma.athlete.findMany({
        where: { clubId: selectedClubId, active: true },
        select: {
          id: true,
          name: true,
          number: true,
          photo: true,
          birthdate: true,
        },
      }),
      prisma.team.count({ where: { clubId: selectedClubId } }),
      prisma.game.count({
        where: { clubId: selectedClubId, date: { gte: now } },
      }),
    ]);

    const upcomingGames: UpcomingGame[] = gamesRaw.map((g) => ({
      id: g.id,
      date: g.date.toISOString(),
      away: g.away,
      number: g.number,
      opponent: g.opponent,
      team: g.team,
      competition: g.competition,
      venue: g.venue,
    }));

    const upcomingBirthdays: UpcomingBirthday[] = athletesRaw
      .filter((a) => a.birthdate !== null)
      .map((a) => {
        const birthdate = a.birthdate as Date;
        const { daysUntil, turningAge } = computeDaysUntilNextBirthday(birthdate, now);
        return {
          id: a.id,
          name: a.name,
          number: a.number,
          photo: a.photo,
          birthdate: birthdate.toISOString(),
          daysUntil,
          turningAge,
        };
      })
      .filter((b) => b.daysUntil <= BIRTHDAY_WINDOW_DAYS)
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, UPCOMING_BIRTHDAYS_LIMIT);

    const byYear = new Map<number, number>();
    athletesRaw.forEach((a) => {
      if (!a.birthdate) return;
      const year = a.birthdate.getFullYear();
      byYear.set(year, (byYear.get(year) ?? 0) + 1);
    });
    const athletesByBirthYear: ChartPoint[] = Array.from(byYear.entries())
      .sort(([ya], [yb]) => ya - yb)
      .map(([year, count]) => ({ label: String(year), value: count }));

    const payload: HomeData = {
      upcomingGames,
      upcomingBirthdays,
      athletesByBirthYear,
      totals: {
        athletes: athletesRaw.length,
        teams: teamsCount,
        upcomingGames: upcomingGamesCount,
      },
    };

    return NextResponse.json(payload);
  } catch (error) {
    log.error('Failed to build home data:', error);
    return NextResponse.json({ error: i18next.t('home.fetch.error') }, { status: 500 });
  }
}
