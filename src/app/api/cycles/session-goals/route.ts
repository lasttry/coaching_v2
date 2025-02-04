import { NextResponse } from 'next/server';
import { SessionGoalInterface } from '@/types/cycles/types';
import { prisma } from '@/lib/prisma';

// GET: List all session goals
export async function GET() {
  try {
    const sessionGoals = await prisma.sessionGoal.findMany({
      include: {
        microcycle: true, // Include parent microcycle
      },
    });

    return NextResponse.json(sessionGoals);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch session goals' }, { status: 500 });
  }
}

// POST: Create a new session goal
export async function POST(request: Request) {
  try {
    const data: SessionGoalInterface = await request.json();

    // Validate required fields
    const { duration, note, coach, microcycleId } = data;
    if (!duration || !microcycleId || !coach) {
      return NextResponse.json({ error: 'Duration, coach, and microcycle ID are required' }, { status: 400 });
    }

    const newSessionGoal = await prisma.sessionGoal.create({
      data: {
        date: new Date(Date.now()),
        duration,
        note,
        coach,
        order: data.order, // Add the required `order` field
        microcycle: {
          // Link to the related microcycle
          connect: { id: microcycleId }, // Ensure `microcycleId` is valid
        },
      },
    });

    return NextResponse.json(newSessionGoal, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create session goal' }, { status: 500 });
  }
}
