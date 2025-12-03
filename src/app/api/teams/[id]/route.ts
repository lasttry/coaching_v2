import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { parseAndValidateId } from '@/utils/validateId';

type Params = Promise<{ id: string }>;

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

export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const teamId = parseAndValidateId(params.id, 'team');
  if (teamId instanceof NextResponse) return teamId;

  try {
    const body = await req.json();

    // ✅ CASE 1: Update athletes safely (no violation of relations)
    if (Array.isArray(body.athleteIds)) {
      const athleteIds: number[] = body.athleteIds.map(Number);

      // 1️⃣ Fetch existing athletes
      const existingAthletes = await prisma.teamAthlete.findMany({
        where: { teamId },
        select: { athleteId: true },
      });

      const existingIds = existingAthletes.map((a) => a.athleteId);
      const toAdd = athleteIds.filter((id) => !existingIds.includes(id));
      const toRemove = existingIds.filter((id) => !athleteIds.includes(id));

      // 2️⃣ Sync changes using transaction
      await prisma.$transaction([
        prisma.teamAthlete.deleteMany({
          where: { teamId, athleteId: { in: toRemove } },
        }),
        prisma.teamAthlete.createMany({
          data: toAdd.map((athleteId) => ({ teamId, athleteId })),
          skipDuplicates: true,
        }),
      ]);

      // 3️⃣ Return updated team
      const updatedTeam = await prisma.team.findUnique({
        where: { id: teamId },
        include: { athletes: { include: { athlete: true } }, echelon: true },
      });

      return NextResponse.json(updatedTeam);
    }

    // ✅ CASE 2: Update team fields
    const { name, type, clubId, echelonId } = body;

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(clubId && { clubId }),
        ...(echelonId && { echelonId }),
      },
      include: { athletes: { include: { athlete: true } }, echelon: true },
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
  const params = await segmentData.params;
  const teamId = parseAndValidateId(params.id, 'team');
  if (teamId instanceof NextResponse) return teamId;

  try {
    await prisma.team.delete({ where: { id: teamId } });
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
  const params = await segmentData.params;
  const teamId = parseAndValidateId(params.id, 'team');
  if (teamId instanceof NextResponse) return teamId;

  try {
    const { athleteIds, action } = await req.json();

    if (!Array.isArray(athleteIds) || !action) {
      log.error('Invalid data for adding/removing athletes');
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    if (action === 'add') {
      await prisma.teamAthlete.createMany({
        data: athleteIds.map((athleteId: number) => ({
          teamId: teamId,
          athleteId,
        })),
        skipDuplicates: true,
      });
    } else if (action === 'remove') {
      await prisma.teamAthlete.deleteMany({
        where: { teamId: teamId, athleteId: { in: athleteIds } },
      });
    } else {
      log.error('Invalid action');
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: { athletes: { include: { athlete: true } } },
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    log.error('Failed to update athletes in team:', error);
    return NextResponse.json({ error: 'Failed to update athletes' }, { status: 500 });
  }
}
