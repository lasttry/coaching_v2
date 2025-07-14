import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: number; athleteId: number }>;

// POST: Add an athlete to a team
export async function POST(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const { id, athleteId } = await segmentData.params;

  try {
    const teamAthlete = await prisma.teamAthlete.create({
      data: {
        teamId: Number(id),
        athleteId: Number(athleteId),
      },
    });

    return NextResponse.json(teamAthlete);
  } catch (error) {
    log.error('Failed to add athlete to team:', error);
    return NextResponse.json({ error: 'Failed to add athlete to team' }, { status: 500 });
  }
}

// DELETE: Remove an athlete from a team
export async function DELETE(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const { id, athleteId } = await segmentData.params;

  try {
    const deletedTeamAthlete = await prisma.teamAthlete.deleteMany({
      where: {
        teamId: Number(id),
        athleteId: Number(athleteId),
      },
    });

    return NextResponse.json(deletedTeamAthlete);
  } catch (error) {
    log.error('Failed to remove athlete from team:', error);
    return NextResponse.json({ error: 'Failed to remove athlete from team' }, { status: 500 });
  }
}
