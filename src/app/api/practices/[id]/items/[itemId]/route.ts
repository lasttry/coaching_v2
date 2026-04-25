import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';
import { sanitiseGraphics } from '../route';

const ALLOWED_TYPES = ['FREETEXT', 'DRILL', 'PLAY', 'BREAKDOWN', 'MY_DRILL'] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

function isAllowedType(v: unknown): v is AllowedType {
  return typeof v === 'string' && (ALLOWED_TYPES as readonly string[]).includes(v);
}

async function resolveItem(
  practiceId: number,
  itemId: number,
  clubId: number
): Promise<{ id: number } | null> {
  const item = await prisma.practiceItem.findFirst({
    where: {
      id: itemId,
      practice: { id: practiceId, clubId },
    },
    select: { id: true },
  });
  return item ?? null;
}

async function getAuthClubId(): Promise<number | null> {
  const session = await auth();
  if (
    !session?.user ||
    !session.user.selectedClubId ||
    isNaN(Number(session.user.selectedClubId))
  ) {
    return null;
  }
  return Number(session.user.selectedClubId);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
): Promise<NextResponse> {
  try {
    const clubId = await getAuthClubId();
    if (clubId === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, itemId } = await params;
    const practiceId = Number(id);
    const iid = Number(itemId);
    const existing = await resolveItem(practiceId, iid, clubId);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body?.type !== undefined) {
      if (!isAllowedType(body.type))
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
      data.type = body.type;
    }
    if (body?.duration !== undefined) {
      const n = Number(body.duration);
      if (!Number.isFinite(n))
        return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
      data.duration = Math.max(0, Math.min(600, Math.round(n)));
    }
    if (body?.title !== undefined) data.title = body.title || null;
    if (body?.text !== undefined) data.text = body.text || null;
    if (body?.drillId !== undefined) data.drillId = body.drillId ? Number(body.drillId) : null;
    if (body?.graphics !== undefined) {
      const sanitised = sanitiseGraphics(body.graphics);
      data.graphics =
        sanitised && sanitised.length > 0
          ? (sanitised as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull;
    }

    const updated = await prisma.practiceItem.update({
      where: { id: iid },
      data,
      include: { drill: { select: { id: true, name: true, svg: true } } },
    });

    /* Hydrate the graphics so the client immediately receives the SVGs
     * and doesn't have to refetch to display updated thumbnails. */
    const entries = sanitiseGraphics(updated.graphics);
    if (entries && entries.length > 0) {
      const graphics = await prisma.drillGraphic.findMany({
        where: { id: { in: entries.map((e) => e.drillGraphicId) } },
        select: { id: true, svg: true },
      });
      const svgMap = new Map(graphics.map((g) => [g.id, g.svg]));
      return NextResponse.json({
        ...updated,
        graphics: entries.map((e) => ({ ...e, svg: svgMap.get(e.drillGraphicId) })),
      });
    }
    return NextResponse.json({ ...updated, graphics: null });
  } catch (error) {
    log.error('Error updating practice item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
): Promise<NextResponse> {
  try {
    const clubId = await getAuthClubId();
    if (clubId === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, itemId } = await params;
    const practiceId = Number(id);
    const iid = Number(itemId);
    const existing = await resolveItem(practiceId, iid, clubId);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.practiceItem.delete({ where: { id: iid } });
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error deleting practice item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
