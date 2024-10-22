import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const gameId = parseInt(params.id, 10);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const athletes = await prisma.gameAthletes.findMany({
      where: {
        gameId: gameId,
      },
      include: {
        athletes: true, // Include the related athletes information
      },
    });

    if (!athletes) {
      return NextResponse.json({ error: 'No athletes found for this game' }, { status: 404 });
    }

    return NextResponse.json(athletes, { status: 200 });
  } catch (error) {
    console.error('Error fetching athletes:', error);
    return NextResponse.json({ error: 'An error occurred while fetching athletes' }, { status: 500 });
  }
}
