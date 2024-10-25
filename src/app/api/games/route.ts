import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST handler for creating a new game
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate the required fields
    if (!data.date || !data.oponentId) {
      return NextResponse.json({ error: 'Date and opponent are required.' }, { status: 400 });
    }

    const newGame = await prisma.games.create({
      data: {
        number: data.number,
        date: new Date(data.date),
        away: data.away != null ? Boolean(data.away) : false,
        competition: data.competition,
        subcomp: data.subcomp,
        oponentId: data.oponentId,
        notes: data.notes || null,
        updatedAt: new Date(), // Set updatedAt manually
        // Update the athletes associated with the game
        gameAthletes: {
          create: data.athleteIds.map((athleteId: number) => ({
            athleteId,
          })),
        },
      },
    });

    return NextResponse.json(newGame, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Error creating game' }, { status: 500 });
  }
}

// GET handler for fetching all games
export async function GET() {
  try {
    const games = await prisma.games.findMany({
      include: {
        teams: true, // Include team details in the response
      },
    });
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Error fetching games' }, { status: 500 });
  }
}
