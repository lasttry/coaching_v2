import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GameAthleteInterface, ObjectiveInterface } from '@/types/game/types';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';
import { parseAndValidateId } from '@/utils/validateId';
import sharp from 'sharp';

async function resizeBase64Image(base64: string, width = 288, height = 203): Promise<string> {
  const buffer = Buffer.from(base64.split(',')[1], 'base64');

  const resized = await sharp(buffer)
    .resize(width, height, {
      fit: 'inside',
    })
    .toBuffer();

  // devolve o base64 final já com o prefixo
  return `data:image/png;base64,${resized.toString('base64')}`;
}

type Params = Promise<{ id: string }>;

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
  const gameId = parseAndValidateId(params.id, 'game');
  if (gameId instanceof NextResponse) return gameId;

  const payload = {
    where: {
      id: gameId,
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
      competition: true,
      competitionSerie: true,
    },
  };
  const game = await prisma.game.findUnique(payload);
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
  const gameId = parseAndValidateId(params.id, 'game');
  if (gameId instanceof NextResponse) return gameId;

  try {
    const data = await req.json();
    if (data === null) {
      return NextResponse.json({}, { status: 200 });
    }
    // Update the game details with `gameNumber` for each athlete
    const payload = {
      where: { id: gameId },
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
            connect: { id: Number(data.competitionId) },
          },
        }),
        ...(data.competitionSerieId && {
          competitionSerie: {
            connect: { id: Number(data.competitionSerieId) },
          },
        }),
        ...(data.opponentId && {
          opponent: {
            connect: { id: Number(data.opponentId) },
          },
        }),
        ...(data.teamId && {
          team: {
            connect: { id: data.teamId },
          },
        }),
        ...(data.objectives && {
          objectives: {
            deleteMany: {
              gameId: gameId,
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
              gameId: gameId,
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
        }),
        ...(data.image1 !== undefined && {
          image1: data.image1 ? await resizeBase64Image(data.image1) : null,
        }),
        ...(data.image2 !== undefined && {
          image2: data.image2 ? await resizeBase64Image(data.image2) : null,
        }),
        ...(data.image3 !== undefined && {
          image3: data.image3 ? await resizeBase64Image(data.image3) : null,
        }),
        ...(data.image4 !== undefined && {
          image4: data.image4 ? await resizeBase64Image(data.image4) : null,
        }),
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
          },
        },
        venue: true,
      },
    };

    const updatedGame = await prisma.game.update(payload);
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
  const gameId = parseAndValidateId(params.id, 'game');
  if (gameId instanceof NextResponse) return gameId;

  try {
    // Delete the game
    await prisma.game.delete({
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
