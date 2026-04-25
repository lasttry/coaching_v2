import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { id } = await params;
    const practiceId = Number(id);

    const practice = await prisma.practice.findFirst({
      where: { id: practiceId, clubId },
      select: { id: true },
    });
    if (!practice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const ids: number[] = Array.isArray(body?.ids) ? body.ids.map((n: unknown) => Number(n)) : [];
    if (ids.length === 0 || ids.some((n) => !Number.isFinite(n))) {
      return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
    }

    const existing = await prisma.practiceItem.findMany({
      where: { practiceId, id: { in: ids } },
      select: { id: true },
    });
    if (existing.length !== ids.length) {
      return NextResponse.json(
        { error: 'Some items do not belong to this practice' },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction(
      ids.map((itemId, idx) =>
        prisma.practiceItem.update({ where: { id: itemId }, data: { order: idx } })
      )
    );

    const items = await prisma.practiceItem.findMany({
      where: { practiceId },
      orderBy: { order: 'asc' },
      include: { drill: { select: { id: true, name: true, svg: true } } },
    });
    return NextResponse.json(items);
  } catch (error) {
    log.error('Error reordering practice items:', error);
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
  }
}
