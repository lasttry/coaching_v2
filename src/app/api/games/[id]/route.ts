import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Utility function to validate the request payload
const validateGameData = (data: any) => {
  const errors: string[] = [];

  // Validate date
  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push('Valid game date is required.');
  }

  // Validate opponent
  if (!data.oponentId || typeof data.oponentId !== 'number') {
    errors.push('Valid opponent ID is required.');
  }

  // Validate athleteIds (must be an array of numbers)
  if (!Array.isArray(data.athleteIds) || data.athleteIds.some((id: any) => typeof id !== 'number')) {
    errors.push('Valid athlete IDs are required.');
  }

  return errors;
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const gameId = parseInt(params.id, 10);

  if (!gameId) {
    return NextResponse.json({ error: 'Invalid Game ID' }, { status: 400 });
  }

  const settings = await prisma.settings.findFirst();
  const game = await prisma.games.findUnique({
    where: {
      id: gameId,
    },
    include: {
      gameAthletes: {
        include: {
          athletes: true,
        },
      },
      teams: true,
    },
  });

  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  // Include athletes in the response
  const athletes = game.gameAthletes.map((ga) => ga.athletes);

  return NextResponse.json({ settings, game: { ...game, athletes } });
}

// PUT method to update an existing game by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const gameId = parseInt(params.id, 10);
  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const data = await request.json();

    // Validate the data
    const validationErrors = validateGameData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(' ') }, { status: 400 });
    }

    // Update the game details
    const updatedGame = await prisma.games.update({
      where: { id: gameId },
      data: {
        number: data.number,
        date: new Date(data.date),
        away: data.away,
        competition: data.competition,
        subcomp: data.subcomp,
        oponentId: data.oponentId,
        notes: data.notes || null,
        // Update the athletes associated with the game
        gameAthletes: {
          deleteMany: {}, // Remove all existing athletes for this game
          create: data.athleteIds.map((athleteId: number) => ({
            athleteId,
          })),
        },
      },
    });

    return NextResponse.json(updatedGame, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error updating game:', error.message);
      return NextResponse.json({ error: 'An error occurred while updating the game.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}

// DELETE method to delete a game by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const gameId = parseInt(params.id, 10);
  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    // Delete the game
    await prisma.games.delete({
      where: { id: gameId },
    });

    return NextResponse.json({ message: 'Game deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error deleting game:', error.message);
      if (error.message.includes('P2003')) {
        // Handle foreign key constraint errors
        return NextResponse.json({ error: 'Unable to delete game due to related records.' }, { status: 409 });
      }
      return NextResponse.json({ error: 'An error occurred while deleting the game.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unknown error occurred.' }, { status: 500 });
  }
}
