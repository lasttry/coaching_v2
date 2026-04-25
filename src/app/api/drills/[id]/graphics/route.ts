import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

type DrillGuard =
  | { error: NextResponse; drill?: undefined }
  | { error?: undefined; drill: { id: number; clubId: number | null } };

async function assertDrill(drillId: number, clubId: number): Promise<DrillGuard> {
  const drill = await prisma.drill.findUnique({
    where: { id: drillId },
    select: { id: true, clubId: true },
  });
  if (!drill) return { error: NextResponse.json({ error: 'Drill not found' }, { status: 404 }) };
  if (drill.clubId !== clubId)
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { drill };
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !session.user.selectedClubId ||
      isNaN(Number(session.user.selectedClubId))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clubId = Number(session.user.selectedClubId);
    const { id } = await ctx.params;
    const drillId = Number(id);
    const guard = await assertDrill(drillId, clubId);
    if (guard.error) return guard.error;

    const graphics = await prisma.drillGraphic.findMany({
      where: { drillId },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(graphics);
  } catch (error) {
    log.error('Error fetching graphics:', error);
    return NextResponse.json({ error: 'Failed to fetch graphics' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !session.user.selectedClubId ||
      isNaN(Number(session.user.selectedClubId))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clubId = Number(session.user.selectedClubId);
    const { id } = await ctx.params;
    const drillId = Number(id);
    const guard = await assertDrill(drillId, clubId);
    if (guard.error) return guard.error;

    const body = await req.json();
    const svg = typeof body?.svg === 'string' ? body.svg : '';

    const last = await prisma.drillGraphic.findFirst({
      where: { drillId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = last ? last.order + 1 : 0;

    const graphic = await prisma.drillGraphic.create({
      data: {
        drillId,
        order,
        svg,
        notes: body?.notes ?? null,
      },
    });
    return NextResponse.json(graphic, { status: 201 });
  } catch (error) {
    log.error('Error creating graphic:', error);
    return NextResponse.json({ error: 'Failed to create graphic' }, { status: 500 });
  }
}
