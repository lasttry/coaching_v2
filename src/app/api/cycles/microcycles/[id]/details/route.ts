import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

type Params = Promise<{ id: string }>;

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
    // Fetch microcycle details along with mesocycle, macrocycle, and session goals
    const microcycleDetails = await prisma.microcycle.findUnique({
      where: { id: Number(id) },
      include: {
        mesocycle: {
          include: {
            macrocycle: true,
          },
        },
        sessionGoals: true,
      },
    });

    // Handle microcycle not found
    if (!microcycleDetails) {
      return NextResponse.json({ error: 'Microcycle not found' }, { status: 404 });
    }

    // Group and format session goals by date
    const groupedGoals = microcycleDetails.sessionGoals.reduce((acc, goal) => {
      if (!goal.date) {
        return acc;
      }

      const formattedDate = dayjs(goal.date).format('YYYY-MM-DD'); // Format date
      const weekday = dayjs(goal.date).format('dddd'); // Format weekday

      if (!acc[formattedDate]) {
        acc[formattedDate] = {
          day: formattedDate,
          weekday,
          goals: [],
        };
      }

      acc[formattedDate].goals.push({
        order: goal.order || 0,
        duration: goal.duration,
        notes: goal.note || '',
        coach: goal.coach,
      });

      return acc;
    }, {} as Record<string, { day: string; weekday: string; goals: { order: number; duration: number; notes: string; coach: string }[] }>);

    // Convert grouped goals into an array for consistent format
    const days = Object.values(groupedGoals).sort((a, b) =>
      new Date(a.day).getTime() - new Date(b.day).getTime()
    );

    // Construct the nested object
    const response = {
      macrocycle: {
        name: microcycleDetails.mesocycle?.macrocycle?.name || 'Unknown Macrocycle',
        mesocycle: {
          name: microcycleDetails.mesocycle?.name || 'Unknown Mesocycle',
          microcycle: {
            name: microcycleDetails.name || 'Unknown Microcycle',
            days,
          },
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching microcycle details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
