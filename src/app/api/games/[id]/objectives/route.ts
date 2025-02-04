import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: number }>;

// GET: Retrieve all objectives for a game
export async function GET(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = params.id;

  try {
    const objectives = await prisma.objectives.findMany({ where: { gameId } });

    return NextResponse.json({ objectives });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch objectives.' }, { status: 500 });
  }
}
