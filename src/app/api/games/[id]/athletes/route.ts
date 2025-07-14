import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: number }>;

export async function GET(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = params.id;

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const athletes = await prisma.gameAthletes.findMany({
      where: {
        gameId: id,
      },
      include: {
        athlete: true, // Include the related athletes information
      },
    });

    if (!athletes) {
      return NextResponse.json({ error: 'No athletes found for this game' }, { status: 404 });
    }

    return NextResponse.json(athletes, { status: 200 });
  } catch (error) {
    console.error('Error fetching athletes:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching athletes' },
      { status: 500 }
    );
  }
}
