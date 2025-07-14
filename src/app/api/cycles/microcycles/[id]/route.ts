import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

interface SessionGoalInput {
  duration: number | string;
  note?: string;
  coach: string;
  date: string;
  order?: number;
}

type Params = Promise<{ id: number }>;

// GET: Retrieve a specific microcycle
export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid microcycle ID' }, { status: 400 });
  }

  try {
    const microcycle = await prisma.microcycle.findUnique({
      where: { id: Number(id) },
      include: {
        mesocycle: {
          include: {
            macrocycle: true, // Include the related macrocycle
          },
        },
        sessionGoals: true,
      },
    });

    if (!microcycle) {
      return NextResponse.json({ error: 'Microcycle not found' }, { status: 404 });
    }

    return NextResponse.json(microcycle);
  } catch (error) {
    console.error('Error fetching microcycle:', error);
    return NextResponse.json({ error: 'Failed to fetch microcycle' }, { status: 500 });
  }
}

// PUT: Update a specific microcycle
export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid microcycle ID' }, { status: 400 });
  }

  const body = await req.json();

  try {
    const sessionGoals = Array.isArray(body.sessionGoals)
      ? (body.sessionGoals as SessionGoalInput[]).map((goal, index) => ({
          duration: parseInt(goal.duration.toString(), 10),
          note: goal.note || null,
          coach: goal.coach,
          date: new Date(goal.date),
          order: goal.order ?? index + 1,
        }))
      : [];
    const payload = {
      where: { id },
      data: {
        number: body.number,
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        notes: body.notes,
        mesocycle: {
          connect: { id: body.mesocycleId },
        },
        sessionGoals: {
          deleteMany: {}, // Remove all existing session goals
          create: sessionGoals,
        },
      },
    };
    const updatedMicrocycle = await prisma.microcycle.update(payload);

    return NextResponse.json(updatedMicrocycle);
  } catch (error) {
    log.error('Error updating microcycle:', error);
    return NextResponse.json({ error: 'Failed to update microcycle' }, { status: 500 });
  }
}

// DELETE: Delete a specific microcycle
export async function DELETE(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid microcycle ID' }, { status: 400 });
  }

  try {
    await prisma.microcycle.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Microcycle deleted successfully' });
  } catch (error) {
    log.error('Error deleting microcycle:', error);
    return NextResponse.json({ error: 'Failed to delete microcycle' }, { status: 500 });
  }
}
