import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: string }>;

export async function GET(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid competition ID' }, { status: 400 });
  }

  try {
    const competitionSeries = await prisma.competitionSerie.findMany({
      where: {
        id: id,
      },
    });

    if (!competitionSeries) {
      return NextResponse.json(
        { error: 'No competitions series found for this game' },
        { status: 404 }
      );
    }

    return NextResponse.json(competitionSeries, { status: 200 });
  } catch (error) {
    log.error('Error fetching competition series:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching competition series' },
      { status: 500 }
    );
  }
}
