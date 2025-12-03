import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchFpbPhaseStandings } from '@/lib/fpb/fetch';

type Params = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
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

  const searchParams = request.nextUrl.searchParams;
  const competitionId = Number(searchParams.get('competitionId'));
  const phaseId = Number(searchParams.get('phaseId'));

  const standings = await fetchFpbPhaseStandings(
    competitionId || null,
    phaseId || null,
    opponent.fpbTeamId || null
  );

  return NextResponse.json({ standings });
}
