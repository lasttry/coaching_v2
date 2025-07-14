import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: number }>;

// GET handler for fetching an opponent by ID
export async function GET(
  request: Request,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid opponent ID' }, { status: 400 });
  }

  try {
    const opponent = await prisma.opponent.findUnique({
      where: { id },
      include: {
        venues: true,
      }
    });

    if (!opponent) {
      return NextResponse.json({ error: 'Opponent not found' }, { status: 404 });
    }

    return NextResponse.json(opponent);
  } catch (error) {
    log.error('Error fetching opponent:', error);
    return NextResponse.json({ error: 'Error fetching opponent' }, { status: 500 });
  }
}

// PUT handler for updating an opponent
export async function PUT(
  request: Request,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid opponent ID' }, { status: 400 });
  }

  try {
    const data = await request.json();

    const updatedOpponent = await prisma.opponent.update({
      where: { id },
      data: {
        name: data.name,
        shortName: data.shortName,
        image: data.image ?? null,
        updatedAt: new Date(),

        venues: {
          deleteMany: { opponentId: id },
          create: (data.venues || []).map((venue: { name: string }) => ({
            name: venue.name,
          })),
        },
      },
      include: {
        venues: true,
      },
    });

    return NextResponse.json(updatedOpponent, { status: 200 });
  } catch (error) {
    log.error('Error updating opponent:', error);
    return NextResponse.json({ error: 'Error updating opponent' }, { status: 500 });
  }
}

// DELETE handler for deleting an opponent
export async function DELETE(
  request: Request,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid opponent ID' }, { status: 400 });
  }

  try {
    await prisma.opponent.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Opponent deleted successfully' }, { status: 200 });
  } catch (error) {
    log.error('Error deleting opponent:', error);
    return NextResponse.json({ error: 'Error deleting opponent' }, { status: 500 });
  }
}
