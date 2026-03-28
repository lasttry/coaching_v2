import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: string }>;

export async function GET(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const athletes = await prisma.gameEquipment.findMany({
      where: {
        gameId: id,
      },
      include: {
        athlete: true,
        equipment: true,
      },
    });

    if (!athletes) {
      return NextResponse.json({ error: 'No equipments found for this game' }, { status: 404 });
    }

    return NextResponse.json(athletes, { status: 200 });
  } catch (error) {
    log.error('Error fetching equipments:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching equipments' },
      { status: 500 }
    );
  }
}
