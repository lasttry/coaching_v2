import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: string }>;

// GET: Retrieve all objectives for a game
export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const gameId = Number(params.id);

  try {
    const objectives = await prisma.objective.findMany({ where: { gameId } });

    return NextResponse.json({ objectives });
  } catch (error) {
    log.error('Error fetching objectives:', error);
    return NextResponse.json({ error: 'Failed to fetch objectives.' }, { status: 500 });
  }
}
