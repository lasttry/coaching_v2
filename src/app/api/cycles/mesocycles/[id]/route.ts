import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: string }>;

// GET: Retrieve a specific mesocycle
export async function GET(request: Request, { params }: { params: Params }): Promise<NextResponse> {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid mesocycle ID' }, { status: 400 });
  }

  try {
    const mesocycle = await prisma.mesocycle.findUnique({
      where: { id: Number(id) },
      include: {
        microcycles: true,
        macrocycle: true,
      },
    });

    if (!mesocycle) {
      return NextResponse.json({ error: 'Mesocycle not found' }, { status: 404 });
    }

    return NextResponse.json(mesocycle);
  } catch (error) {
    log.error('Error fetching mesocycle:', error);
    return NextResponse.json({ error: 'Failed to fetch mesocycle' }, { status: 500 });
  }
}

// PUT: Update a specific mesocycle
export async function PUT(request: Request, { params }: { params: Params }): Promise<NextResponse> {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid mesocycle ID' }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { name, startDate, endDate, notes, macrocycleId } = data;
    const mesocycleId = Number(id);
    const macrocycleIdNumber = Number(macrocycleId);

    const existingMesocycle = await prisma.mesocycle.findUnique({
      where: { id: mesocycleId },
      select: { macrocycleId: true, number: true },
    });

    if (!existingMesocycle) {
      return NextResponse.json({ error: 'Mesocycle not found' }, { status: 404 });
    }
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    const targetMacrocycleId = macrocycleIdNumber || existingMesocycle.macrocycleId;
    const macrocycle = await prisma.macrocycle.findUnique({
      where: { id: targetMacrocycleId },
      select: { startDate: true, endDate: true },
    });
    if (!macrocycle) {
      return NextResponse.json({ error: 'Macrocycle not found' }, { status: 404 });
    }
    const effectiveStartDate = parsedStartDate ?? macrocycle.startDate;
    const effectiveEndDate = parsedEndDate ?? macrocycle.endDate;
    if (
      effectiveStartDate < macrocycle.startDate ||
      effectiveStartDate > macrocycle.endDate ||
      effectiveEndDate < macrocycle.startDate ||
      effectiveEndDate > macrocycle.endDate
    ) {
      return NextResponse.json(
        { error: 'Mesocycle dates must be within macrocycle date range' },
        { status: 400 }
      );
    }
    if (effectiveEndDate < effectiveStartDate) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 });
    }

    let nextNumber = existingMesocycle.number ?? 1;
    if (macrocycleIdNumber && macrocycleIdNumber !== existingMesocycle.macrocycleId) {
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
      nextNumber = (lastMesocycle?.number ?? 0) + 1;
    }

    const payload = {
      where: { id: mesocycleId },
      data: {
        name,
        number: nextNumber,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        notes,
        macrocycleId: targetMacrocycleId,
      },
    };
    const updatedMesocycle = await prisma.mesocycle.update(payload);

    return NextResponse.json(updatedMesocycle);
  } catch (error) {
    log.error(error);
    return NextResponse.json({ error: 'Failed to update mesocycle' }, { status: 500 });
  }
}

// DELETE: Delete a specific mesocycle
export async function DELETE(
  request: Request,
  { params }: { params: Params }
): Promise<NextResponse> {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid mesocycle ID' }, { status: 400 });
  }

  try {
    await prisma.mesocycle.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Mesocycle deleted successfully' });
  } catch (error) {
    log.error('Error deleting mesocycle:', error);
    return NextResponse.json({ error: 'Failed to delete mesocycle' }, { status: 500 });
  }
}
