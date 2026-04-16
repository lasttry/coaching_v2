import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

// GET: List all mesocycles
export async function GET(): Promise<NextResponse> {
  try {
    const mesocycles = await prisma.mesocycle.findMany({
      include: {
        microcycles: true, // Include related microcycles
        macrocycle: true, // Include parent macrocycle
      },
    });

    return NextResponse.json(mesocycles);
  } catch (error) {
    log.error('Error fetching mesocycles:', error);
    return NextResponse.json({ error: 'Failed to fetch mesocycles' }, { status: 500 });
  }
}

// POST: Create a new mesocycle
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const data = await request.json();

    // Validate required fields
    const { name, startDate, endDate, notes, macrocycleId } = data;
    if (!startDate || !endDate || !macrocycleId) {
      return NextResponse.json(
        { error: 'Start date, end date, and macrocycle ID are required' },
        { status: 400 }
      );
    }
    const macrocycleIdNumber = Number(macrocycleId);
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    const macrocycle = await prisma.macrocycle.findUnique({
      where: { id: macrocycleIdNumber },
      select: { startDate: true, endDate: true },
    });
    if (!macrocycle) {
      return NextResponse.json({ error: 'Macrocycle not found' }, { status: 404 });
    }
    if (
      parsedStartDate < macrocycle.startDate ||
      parsedStartDate > macrocycle.endDate ||
      parsedEndDate < macrocycle.startDate ||
      parsedEndDate > macrocycle.endDate
    ) {
      return NextResponse.json(
        { error: 'Mesocycle dates must be within macrocycle date range' },
        { status: 400 }
      );
    }
    if (parsedEndDate < parsedStartDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    const lastMesocycle = await prisma.mesocycle.findFirst({
      where: {
        macrocycleId: macrocycleIdNumber,
        number: { not: null },
      },
      orderBy: {
        number: 'desc',
      },
      select: {
        number: true,
      },
    });
    const nextNumber = (lastMesocycle?.number ?? 0) + 1;

    const newMesocycle = await prisma.mesocycle.create({
      data: {
        name,
        number: nextNumber,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        notes,
        macrocycleId: macrocycleIdNumber,
      },
    });

    return NextResponse.json(newMesocycle, { status: 201 });
  } catch (error) {
    log.error('Error creating mesocycle:', error);
    return NextResponse.json({ error: 'Failed to create mesocycle' }, { status: 500 });
  }
}
