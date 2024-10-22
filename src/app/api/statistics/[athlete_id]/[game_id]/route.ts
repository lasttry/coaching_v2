import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { athlete_id: string, game_id: string } }) {
  const { athlete_id, game_id } = params;

  try {
    const stats = await prisma.athleteGameStatistics.findFirst({
      where: {
        athlete_id: parseInt(athlete_id),
        game_id: parseInt(game_id),
      },
    });

    if (!stats) {
      return NextResponse.json({ message: 'Statistics not found' }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to retrieve statistics' }, { status: 500 });
  }
}
