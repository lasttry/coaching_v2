import { NextResponse } from 'next/server';
import { fetchFpbGameOfficials } from '@/lib/fpb/fetch';
import { log } from '@/lib/logger';

type Params = Promise<{ id: string }>;

export async function GET(
  request: Request,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const gameId = Number(params.id);

  if (Number.isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const latestResults = await fetchFpbGameOfficials(gameId);
    return NextResponse.json(latestResults);
  } catch (error) {
    log.error('Error fetching FPB officials:', error);
    return NextResponse.json({ error: 'Error fetching FPB officials' }, { status: 500 });
  }
}
