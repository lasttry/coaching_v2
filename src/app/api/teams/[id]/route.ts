import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: number }>;

// GET: Retrieve a specific team
export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const { id } = await segmentData.params;
  try {
    const team = await prisma.team.findUnique({
      where: { id: Number(id) },
      include: {
        club: true,
        echelon: true,
        athletes: { include: { athlete: true } },
      },
    });

    if (!team) {
      log.error(`Team with id ${id} not found`);
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    log.error('Failed to fetch team:', error);
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

// PUT: Update a specific team
export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const { id } = await segmentData.params;
  try {
    const { name, type, clubId, echelonId } = await req.json();

    const updatedTeam = await prisma.team.update({
      where: { id },
      data: { name, type, clubId, echelonId },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    log.error('Failed to update team:', error);
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
  }
}

// DELETE: Remove a specific team
export async function DELETE(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const { id } = await segmentData.params;
  try {
    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ message: 'Team deleted successfully' });
  } catch (error) {
    log.error('Failed to delete team:', error);
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 });
  }
}

// PATCH: Add or remove athletes
export async function PATCH(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const { id } = await segmentData.params;
  const idNumber = Number(id);
  try {
    const { athleteIds, action } = await req.json();

    if (!Array.isArray(athleteIds) || !action) {
      log.error('Invalid data for adding/removing athletes');
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    if (action === 'add') {
      await prisma.teamAthlete.createMany({
        data: athleteIds.map((athleteId: number) => ({
          teamId: idNumber,
          athleteId,
        })),
        skipDuplicates: true,
      });
    } else if (action === 'remove') {
      await prisma.teamAthlete.deleteMany({
        where: { teamId: idNumber, athleteId: { in: athleteIds } },
      });
    } else {
      log.error('Invalid action');
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedTeam = await prisma.team.findUnique({
      where: { id: idNumber },
      include: { athletes: { include: { athlete: true } } },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    log.error('Failed to update athletes in team:', error);
    return NextResponse.json({ error: 'Failed to update athletes' }, { status: 500 });
  }
}
