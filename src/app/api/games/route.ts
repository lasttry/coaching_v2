import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GameAthleteInterface } from '@/types/games/types';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

// POST handler for creating a new game
export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (
    !session?.user ||
    !session.user.selectedClubId ||
    isNaN(Number(session.user.selectedClubId))
  ) {
    log.error('games/route.ts>POST: session invalid or club not selected');
    return NextResponse.json({ status: 402 });
  }

  try {
    const data = await req.json();

    const payload = {
      data: {
        club: {
          connect: { id: session.user.selectedClubId },
        },
        number: data.number ? Number(data.number) : null,
        date: new Date(data.date),
        away: Boolean(data.away),
        notes: data.notes ?? null,
        gameAthletes: {
          create: (data.gameAthletes || [])
          .filter((athlete: GameAthleteInterface) => athlete.athlete?.id !== null)
          .map((athlete: GameAthleteInterface) => ({
            athleteId: athlete.athlete!.id,
            number: athlete.number,
            period1: athlete.period1,
            period2: athlete.period2,
            period3: athlete.period3,
            period4: athlete.period4,
          })),
        },
        ...(data.venueId
          ? { venue: { connect: { id: data.venueId } } }
          : { venue: { disconnect: true } }),
        competition: {
          connect: { id: data.competition.id },
        },
        ...(data.competitionSerieId && {
          competitionSerie: {
            connect: { id: data.competitionSerieId },
          },
        }),
        ...(data.opponentId && {
          opponent: {
            connect: { id: data.opponentId },
          },
        }),
        ...(data.teamId && {
          team: {
            connect: { id: data.teamId },
          },
        }),
      },
    };
    const newGame = await prisma.game.create({
      ...payload,
      include: {
        opponent: true,
        team: { include: { echelon: true } },
        competition: true,
        competitionSerie: true,
        gameAthletes: { include: { athlete: true } },
        venue: true, // ✅ aqui está o que faltava
      },
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    log.error('Error creating game:', error);
    return NextResponse.json({ error: `Error creating game: ${error}` }, { status: 500 });
  }
}

// GET /api/games?page=1&pageSize=10
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const skip = (page - 1) * pageSize;

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        skip,
        take: pageSize,
        orderBy: { date: 'desc' },
        include: {
          team: { include: { echelon: true, club: true } },
          opponent: true,
          competition: { include: { competitionSeries: true } },
          venue: true,
          gameAthletes: { include: { athlete: true } },
        },
      }),
      prisma.game.count(),
    ]);

    return NextResponse.json({
      games,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    log.error('Failed to fetch games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
