import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all microcycles
export async function GET() {
  try {
    const microcycles = await prisma.microcycle.findMany({
      include: {
        sessionGoals: true,
        mesocycle: {
          include: {
            macrocycle: true,
          },
        },
      },
    });

    return NextResponse.json(microcycles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch microcycles' }, { status: 500 });
  }
}

// POST: Create a new microcycle
export async function POST(request: Request) {
  const body = await request.json();

  try {
    console.log(`Request Body:`, body);
    const payload = {
      data: {
        number: body.number,
        name: body.name,
        startDate: body.startDate,
        endDate: body.endDate,
        notes: body.notes,
        mesocycle: {
          connect: { id: body.mesocycle.id }, // Provide the ID of the related mesocycle
        },
        sessionGoals: {
          create: body.sessionGoals.map((goal: { duration: string; note: string; coach: string }) => ({
            duration: goal.duration,
            note: goal.note,
            coach: goal.coach,
          })),
        },
      },
      include: {
        sessionGoals: true,
      },
    };
    console.log([payload]);
    const newMicrocycle = await prisma.microcycle.create(payload);

    return NextResponse.json(newMicrocycle);
  } catch (error) {
    console.error('Error creating microcycle:', error);
    return NextResponse.json({ error: 'Failed to create microcycle' }, { status: 500 });
  }
}
