import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateGameData } from './utils/utils';
import { GameAthleteInterface } from '@/types/games/types';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

// POST handler for creating a new game
export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user || !session.user.selectedClubId || isNaN(Number(session.user.selectedClubId))) {
    log.error('games/route.ts>POST: session invalid or club not selected');
    return NextResponse.json({ status: 402 });
  }

  try {
    const data = await req.json();

    const validationErrors = validateGameData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(' ') }, { status: 400 });
    }
    log.debug(data);
    const newGame = await prisma.games.create({
      data: {
        clubId: session.user.selectedClubId,
        number: Number(data.number),
        date: new Date(data.date),
        away: data.away !== null ? Boolean(data.away) : false,
        competition: data.competition,
        subcomp: data.subcomp,
        notes: data.notes || null,
        opponentId: data.oponentId,
        gameAthletes: {
          create: data.gameAthletes.map((athlete: GameAthleteInterface) => ({
            athleteId: athlete.athlete.id,
            number: athlete.number,
          })),
        },
      },
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    log.error('Error creating game:', error);
    return NextResponse.json({ error: `Error creating game: ${error}` }, { status: 500 });
  }
}

// GET handler for fetching all games
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user || !session.user.selectedClubId || isNaN(Number(session.user.selectedClubId))) {
    log.error('games/route.ts>GET: session invalid or club not selected');
    return NextResponse.json({ status: 402 });
  }

  try {
    const payload = {
      where: {
        clubId: Number(session.user.selectedClubId), // Filter by clubId
      },
      include: {
        opponent: true, // Include opponent team details in the response
      },
    };

    const games = await prisma.games.findMany(payload);
    log.info('Games fetched successfully:', games);
    return NextResponse.json(games);
  } catch (error) {
    log.error('Error fetching games:', error);
    return NextResponse.json({ error: `Error fetching game: ${error}` }, { status: 500 });
  }
}
