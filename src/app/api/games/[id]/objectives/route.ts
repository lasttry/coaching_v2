import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
type Params = Promise<{ id: number }>;

// GET: Retrieve all objectives for a game
export async function GET(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = params.id;

  try {
    const defensiveObjectives = await prisma.defensiveObjective.findMany({ where: { gameId } });
    const offensiveObjectives = await prisma.offensiveObjective.findMany({ where: { gameId } });

    return NextResponse.json({ defensiveObjectives, offensiveObjectives });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch objectives.' }, { status: 500 });
  }
}

// POST: Add a new objective to a game
export async function POST(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = params.id;
  const { type, title, description } = await req.json();

  if (!['defensive', 'offensive'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type specified.' }, { status: 400 });
  }

  try {
    const newObjective =
      type === 'defensive'
        ? await prisma.defensiveObjective.create({ data: { gameId, title, description } })
        : await prisma.offensiveObjective.create({ data: { gameId, title, description } });

    return NextResponse.json(newObjective, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add objective.' }, { status: 500 });
  }
}
