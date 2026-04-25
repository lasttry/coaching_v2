import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

// GET: List all macrocycles
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !session.user.selectedClubId ||
      isNaN(Number(session.user.selectedClubId))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const macrocycles = await prisma.macrocycle.findMany({
      where: {
        clubId: Number(session.user.selectedClubId),
      },
      include: {
        mesocycles: true,
        team: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(macrocycles);
  } catch (error) {
    log.error('Error fetching macrocycles:', error);
    return NextResponse.json({ error: 'Failed to fetch macrocycles' }, { status: 500 });
  }
}

// POST: Create a new macrocycle
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !session.user.selectedClubId ||
      isNaN(Number(session.user.selectedClubId))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const { name, startDate, endDate, notes, teamId } = data;
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }
    if (!teamId || isNaN(Number(teamId))) {
      return NextResponse.json({ error: 'Team is required' }, { status: 400 });
    }

    const clubId = Number(session.user.selectedClubId);

    const team = await prisma.team.findUnique({
      where: { id: Number(teamId) },
      select: { id: true, clubId: true },
    });
    if (!team || team.clubId !== clubId) {
      return NextResponse.json({ error: 'Team does not belong to this club' }, { status: 400 });
    }

    const lastMacrocycle = await prisma.macrocycle.findFirst({
      where: {
        clubId,
        number: { not: null },
      },
      orderBy: {
        number: 'desc',
      },
      select: {
        number: true,
      },
    });
    const nextNumber = (lastMacrocycle?.number ?? 0) + 1;

    const newMacrocycle = await prisma.macrocycle.create({
      data: {
        name,
        number: nextNumber,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
        club: { connect: { id: clubId } },
        team: { connect: { id: Number(teamId) } },
      },
      include: {
        mesocycles: true,
        team: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(newMacrocycle, { status: 201 });
  } catch (error) {
    log.error('Error creating macrocycle:', error);
    return NextResponse.json({ error: 'Failed to create macrocycle' }, { status: 500 });
  }
}
