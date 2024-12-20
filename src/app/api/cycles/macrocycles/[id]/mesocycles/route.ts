import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: number }>;

export async function GET(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: 'Invalid Macrocycle ID' },
      { status: 400 },
    );
  }

  try {
    const mesocycles = await prisma.mesocycle.findMany({
      where: {
        macrocycleId: id,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return NextResponse.json(mesocycles, { status: 200 });
  } catch (error) {
    console.error('Error fetching mesocycles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mesocycles.' },
      { status: 500 },
    );
  }
}
