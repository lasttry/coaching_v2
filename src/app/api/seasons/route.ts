import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SeasonInterface } from '@/types/season/type';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';

interface SeasonBody {
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

// GET /api/seasons
export async function GET(): Promise<NextResponse<SeasonInterface[] | { error: string }>> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const seasons = await prisma.season.findMany({
      orderBy: [{ startDate: 'desc' }],
    });

    const result: SeasonInterface[] = seasons.map((s) => ({
      id: s.id,
      name: s.name,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      isCurrent: s.isCurrent,
    }));

    return NextResponse.json(result);
  } catch (error) {
    log.error('Error fetching seasons:', error);
    return NextResponse.json({ error: 'Failed to fetch seasons' }, { status: 500 });
  }
}

// POST /api/seasons
export async function POST(
  req: NextRequest
): Promise<NextResponse<SeasonInterface | { error: string }>> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SeasonBody;

  try {
    body = (await req.json()) as SeasonBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = body.name?.trim();
  const startDateStr = body.startDate;
  const endDateStr = body.endDate;
  const isCurrent = body.isCurrent ?? false;

  if (!name) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  if (!startDateStr || !endDateStr) {
    return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 });
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return NextResponse.json(
      { error: 'startDate and endDate must be valid ISO date strings' },
      { status: 400 }
    );
  }

  if (startDate >= endDate) {
    return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 });
  }

  // Se esta nova season for current, garantimos que só existe uma current
  const created = await prisma.$transaction(async (tx) => {
    if (isCurrent) {
      await tx.season.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false },
      });
    }

    return tx.season.create({
      data: {
        name,
        startDate,
        endDate,
        isCurrent,
      },
    });
  });

  const result: SeasonInterface = {
    id: created.id,
    name: created.name,
    startDate: created.startDate.toISOString(),
    endDate: created.endDate.toISOString(),
    isCurrent: created.isCurrent,
  };

  return NextResponse.json(result, { status: 201 });
}
