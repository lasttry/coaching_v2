import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchFpbLatestResults } from '@/lib/fpb/fetch';
import { log } from '@/lib/logger';

type Params = Promise<{ id: string }>;

export async function GET(
  request: Request,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const opponentId = Number(params.id);

  if (Number.isNaN(opponentId)) {
    return NextResponse.json({ error: 'Invalid opponent ID' }, { status: 400 });
  }

  const opponent = await prisma.opponent.findUnique({
    where: { id: opponentId },
  });

  if (!opponent || opponent.fpbTeamId === null) {
    return NextResponse.json({ error: 'Opponent or FPB team id not found' }, { status: 404 });
  }

  try {
    const latestResults = await fetchFpbLatestResults(opponent.fpbTeamId, 10);
    return NextResponse.json({ results: latestResults });
  } catch (error) {
    log.error('Error fetching FPB results:', error);
    return NextResponse.json({ error: 'Error fetching FPB results' }, { status: 500 });
  }
}
