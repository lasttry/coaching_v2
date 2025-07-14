import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GameAthleteInterface, ObjectiveInterface } from '@/types/games/types';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

type Params = Promise<{ id: number }>;

export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const session = await auth();
  if (
    !session?.user ||
    !session.user.selectedClubId ||
    isNaN(Number(session.user.selectedClubId))
  ) {
    log.error('games/[id]/route.ts>GET: session invalid or club not selected');
    return NextResponse.json({ status: 401 });
  }

  const params = await segmentData.params;
  const id = Number(params.id);

  if (!id) {
    return NextResponse.json({ error: 'Game id is invalid' }, { status: 400 });
  }

  const payload = {
    where: {
      id,
      clubId: Number(session.user.selectedClubId),
    },
    include: {
      gameAthletes: {
        include: {
          athlete: true,
        },
      },
      opponent: true,
      objectives: true,
      club: true,
    },
  };
  const game = await prisma.games.findUnique(payload);
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  return NextResponse.json({ ...game, objectives: game.objectives || [] });
}

// PUT method to update an existing game by ID
export async function PUT(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const session = await auth();
  if (
    !session?.user ||
    !session.user.selectedClubId ||
    isNaN(Number(session.user.selectedClubId))
  ) {
    log.error('games/[id]/route.ts>PUT: session invalid or club not selected');
    return NextResponse.json({ status: 401 });
  }

  const params = await segmentData.params;
  const id = Number(params.id);
  try {
    const data = await req.json();
    if (data === null) {
      return NextResponse.json({}, { status: 200 });
    }
    // Update the game details with `gameNumber` for each athlete
    const payload = {
      where: { id },
      data: {
        club: {
          connect: { id: session.user.selectedClubId },
        },
        ...(data.number !== undefined && { number: Number(data.number) }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.away !== undefined && { away: data.away }),
        ...(data.notes !== undefined && { notes: data.notes || null }),
        ...(data.venueId
          ? { venue: { connect: { id: data.venueId } } }
          : { venue: { disconnect: true } }),
        ...(data.competition && {
          competition: {
            connect: { id: Number(data.competitionId)}
          }
        }),
        ...(data.competitionSerieId && {
          competitionSerie: {
            connect: { id: Number(data.competitionSerieId)}
          }
        }),
        ...(data.opponentId && {
          opponent: {
            connect: { id: Number(data.opponentId) },
          },
        }),
        ...(data.teamId && {
          team: {
            connect: { id : data.teamId },
          }
        }),
        ...(data.objectives && {
          objectives: {
            deleteMany: {
              gameId: id,
            },
            create:
              data.objectives?.map((objective: ObjectiveInterface) => ({
                title: objective.title,
                description: objective.description,
                type: objective.type,
              })) || [],
          },
        }),
        ...(data.gameAthletes && {
          gameAthletes: {
            deleteMany: {
              gameId: id,
            },
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
        })
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
    log.debug(data);
    log.debug(JSON.stringify(payload));
    const updatedGame = await prisma.games.update(payload);
    return NextResponse.json(updatedGame, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      log.error('Error updating game:', error.message);
      return NextResponse.json(
        { error: `Error updating the game: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'Error unknown' }, { status: 500 });
  }
}

// DELETE method to delete a game by ID
export async function DELETE(
  request: Request,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const gameId = params.id;
  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    // Delete the game
    await prisma.games.delete({
      where: { id: Number(gameId) },
    });

    return NextResponse.json({ message: 'Game deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting game:', error.message);
      if (error.message.includes('P2003')) {
        // Handle foreign key constraint errors
        return NextResponse.json(
          { error: 'Unable to delete game due to related records.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'An error occurred while deleting the game.' },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
