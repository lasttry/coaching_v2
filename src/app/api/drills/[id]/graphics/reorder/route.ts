import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

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

    const drill = await prisma.drill.findUnique({
      where: { id: drillId },
      select: { id: true, clubId: true },
    });
    if (!drill) return NextResponse.json({ error: 'Drill not found' }, { status: 404 });
    if (drill.clubId !== clubId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const orderedIds = Array.isArray(body?.orderedIds)
      ? (body.orderedIds as unknown[]).map((v) => Number(v)).filter((n) => !isNaN(n))
      : null;
    if (!orderedIds || orderedIds.length === 0) {
      return NextResponse.json({ error: 'orderedIds is required' }, { status: 400 });
    }

    const graphics = await prisma.drillGraphic.findMany({
      where: { drillId },
      select: { id: true },
    });
    const existing = new Set(graphics.map((g) => g.id));
    if (orderedIds.some((gid) => !existing.has(gid))) {
      return NextResponse.json({ error: 'Invalid graphic id' }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((gid, index) =>
        prisma.drillGraphic.update({ where: { id: gid }, data: { order: index } })
      )
    );

    const updated = await prisma.drillGraphic.findMany({
      where: { drillId },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(updated);
  } catch (error) {
    log.error('Error reordering graphics:', error);
    return NextResponse.json({ error: 'Failed to reorder graphics' }, { status: 500 });
  }
}
