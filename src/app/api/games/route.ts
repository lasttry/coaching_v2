import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateGameData } from './utils/utils';
import { GameAthleteInterface } from '@/types/games/types';

const prisma = new PrismaClient();

// POST handler for creating a new game
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const validationErrors = validateGameData(data);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors.join(' ') },
        { status: 400 },
      );
    }
    console.log(data);
    const newGame = await prisma.games.create({
      data: {
        number: Number(data.number),
        date: new Date(data.date),
        away: data.away != null ? Boolean(data.away) : false,
        competition: data.competition,
        subcomp: data.subcomp,
        oponentId: data.oponentId,
        notes: data.notes || null,
        updatedAt: new Date(), // Set updatedAt manually
        // Update the athletes associated with the game
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
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: `Error creating game:` },
      { status: 500 },
    );
  }
}

// GET handler for fetching all games
export async function GET() {
  try {
    const payload = {
      include: {
        oponent: true, // Include team details in the response
      },
    };
    const games = await prisma.games.findMany(payload);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Error fetching games' },
      { status: 500 },
    );
  }
}
