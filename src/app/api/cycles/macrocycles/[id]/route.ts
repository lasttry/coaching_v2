import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

type Params = Promise<{ id: string }>;

// GET: Retrieve a specific macrocycle
export async function GET(request: Request, { params }: { params: Params }): Promise<NextResponse> {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid macrocycle ID' }, { status: 400 });
  }

  try {
    const macrocycle = await prisma.macrocycle.findUnique({
      where: { id: Number(id) },
      include: {
        mesocycles: true,
        team: { select: { id: true, name: true } },
      },
    });

    if (!macrocycle) {
      return NextResponse.json({ error: 'Macrocycle not found' }, { status: 404 });
    }

    return NextResponse.json(macrocycle);
  } catch (error) {
    log.error('Error fetching macrocycle:', error);
    return NextResponse.json({ error: 'Failed to fetch macrocycle' }, { status: 500 });
  }
}

// PUT: Update a specific macrocycle
export async function PUT(request: Request, { params }: { params: Params }): Promise<NextResponse> {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid macrocycle ID' }, { status: 400 });
  }

  try {
    const session = await auth();
    if (
      !session?.user ||
      !session.user.selectedClubId ||
      isNaN(Number(session.user.selectedClubId))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clubId = Number(session.user.selectedClubId);

    const data = await request.json();
    const { name, number, startDate, endDate, notes, teamId } = data;

    if (teamId != null) {
      const team = await prisma.team.findUnique({
        where: { id: Number(teamId) },
        select: { clubId: true },
      });
      if (!team || team.clubId !== clubId) {
        return NextResponse.json({ error: 'Team does not belong to this club' }, { status: 400 });
      }
    }

    const updatedMacrocycle = await prisma.macrocycle.update({
      where: { id: Number(id) },
      data: {
        name,
        number,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes,
        teamId: teamId != null ? Number(teamId) : null,
      },
      include: {
        mesocycles: true,
        team: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updatedMacrocycle);
  } catch (error) {
    log.error('Error updating macrocycle:', error);
    return NextResponse.json({ error: 'Failed to update macrocycle' }, { status: 500 });
  }
}

// DELETE: Delete a specific macrocycle
export async function DELETE(
  request: Request,
  { params }: { params: Params }
): Promise<NextResponse> {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid macrocycle ID' }, { status: 400 });
  }

  try {
    await prisma.macrocycle.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Macrocycle deleted successfully' });
  } catch (error) {
    log.error('Error deleting macrocycle:', error);
    return NextResponse.json({ error: 'Failed to delete macrocycle' }, { status: 500 });
  }
}
