import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function GET(): Promise<NextResponse> {
  try {
    const competitions = await prisma.competition.findMany({
      include: {
        echelon: true,
        competitionSeries: true,
      },
    });
    return NextResponse.json(competitions, { status: 200 });
  } catch (error) {
    log.error(`Error fetching competitions: ${error}`);
    return NextResponse.json({ error: 'Error fetching competitions' }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const data = await req.json();
    const newCompetition = await prisma.competition.create({
      data: {
        name: data.name,
        description: data.description || null,
        image: data.image || null,
        echelon: { connect: { id: data.echelonId } },
      },
      include: { echelon: true },
    });
    return NextResponse.json(newCompetition, { status: 201 });
  } catch (error) {
    log.error(error);
    return NextResponse.json({ error: 'Error creating competition' }, { status: 500 });
  }
}
