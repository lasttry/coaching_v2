import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SeasonInterface } from '@/types/season/types';

// GET /api/seasons/current
export async function GET(): Promise<NextResponse<SeasonInterface | { error: string }>> {
  const season = await prisma.season.findFirst({
    where: { isCurrent: true },
    orderBy: { startDate: 'desc' },
  });

  if (!season) {
    return NextResponse.json({ error: 'No current season defined' }, { status: 404 });
  }

  const result: SeasonInterface = {
    id: season.id,
    name: season.name,
    startDate: season.startDate.toISOString(),
    endDate: season.endDate.toISOString(),
    isCurrent: season.isCurrent,
  };

  return NextResponse.json(result);
}
