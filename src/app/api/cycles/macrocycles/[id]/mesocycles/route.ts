import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handler for GET request to fetch Mesocycles by Macrocycle ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const macrocycleId = parseInt(params.id);

  if (isNaN(macrocycleId)) {
    return NextResponse.json({ error: 'Invalid Macrocycle ID' }, { status: 400 });
  }

  try {
    const mesocycles = await prisma.mesocycle.findMany({
      where: {
        macrocycleId: macrocycleId,
      },
      orderBy: {
        startDate: 'asc', // Order by start date ascending
      },
    });

    return NextResponse.json(mesocycles);
  } catch (error) {
    console.error('Error fetching Mesocycles:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching Mesocycles.' },
      { status: 500 }
    );
  }
}
