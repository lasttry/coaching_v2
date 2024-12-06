import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
type Params = Promise<{ id: number }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  // Validate the ID parameter
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid microcycle ID' }, { status: 400 });
  }

  try {
    // Fetch microcycle details along with session goals
    const microcycleDetails = await prisma.microcycle.findUnique({
      where: { id: Number(id) },
      include: {
        sessionGoals: {
          select: {
            duration: true,
            note: true,
            coach: true,
          },
        },
      },
    });

    // Handle microcycle not found
    if (!microcycleDetails) {
      return NextResponse.json({ error: 'Microcycle not found' }, { status: 404 });
    }

    // Example: Dynamically generate days if needed (you can customize this logic)
    const days = microcycleDetails.sessionGoals.map((_, index) => `Day ${index + 1}`);

    // Format session data for front-end use
    const sessions = microcycleDetails.sessionGoals.map((session) => ({
      durations: [session.duration],
      notes: [session.note, session.coach],
    }));

    return NextResponse.json({ days, sessions });
  } catch (error) {
    console.error('Error fetching microcycle details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
