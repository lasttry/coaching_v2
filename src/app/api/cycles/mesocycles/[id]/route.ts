import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: number }>;

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
    console.error(error);
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
    const { name, number, startDate, endDate, notes, macrocycleId } = data;

    const payload = {
      where: { id: Number(id) },
      data: {
        name,
        number: Number(number),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes,
        macrocycleId,
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
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete mesocycle' }, { status: 500 });
  }
}
