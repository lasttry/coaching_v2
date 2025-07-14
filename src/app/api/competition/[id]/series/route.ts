import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: number }>;

export async function GET(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = params.id;

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
    console.error('Error fetching competition series:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching competition series' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = params.id;

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid competition ID' }, { status: 400 });
  }

  try {
    log.debug("create new competions series...")
  } catch (error) {
    console.error('Error creating competition series:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating competition series' },
      { status: 500 }
    );
  }
}
