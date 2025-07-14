import { NextResponse } from 'next/server';
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
    const newGame = await prisma.games.create({
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

// GET handler for fetching all games
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (
    !session?.user ||
    !session.user.selectedClubId ||
    isNaN(Number(session.user.selectedClubId))
  ) {
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
        team: {
          include: {
            echelon: true, // ✅ include the nested echelon inside team
          },
        },
        competition: true,
        competitionSerie: true,
        gameAthletes: {
          include: {
            athlete: true,
          }
        },
        venue: true,
      },
    };

    const games = await prisma.games.findMany(payload);
    log.debug(games)
    return NextResponse.json(games);
  } catch (error) {
    log.error('Error fetching games:', error);
    return NextResponse.json({ error: `Error fetching game: ${error}` }, { status: 500 });
  }
}
