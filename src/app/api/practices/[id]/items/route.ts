import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

const ALLOWED_TYPES = ['FREETEXT', 'DRILL', 'PLAY', 'BREAKDOWN', 'MY_DRILL'] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

function isAllowedType(v: unknown): v is AllowedType {
  return typeof v === 'string' && (ALLOWED_TYPES as readonly string[]).includes(v);
}

export interface PracticeItemGraphicEntry {
  drillGraphicId: number;
  caption: string;
  printFirst: boolean;
  printOther: boolean;
}

/** Normalise a client-supplied graphics array into the shape we store in
 * the database. Keeps only recognised fields and clamps captions to a
 * reasonable length so an over-eager client can't bloat the record. */
export function sanitiseGraphics(value: unknown): PracticeItemGraphicEntry[] | null {
  if (!Array.isArray(value)) return null;
  const out: PracticeItemGraphicEntry[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    const id = Number(row.drillGraphicId);
    if (!Number.isFinite(id) || id <= 0) continue;
    out.push({
      drillGraphicId: id,
      caption: typeof row.caption === 'string' ? row.caption.slice(0, 1000) : '',
      printFirst: !!row.printFirst,
      printOther: !!row.printOther,
    });
  }
  return out;
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

async function assertPracticeBelongsToClub(practiceId: number, clubId: number): Promise<boolean> {
  const existing = await prisma.practice.findFirst({
    where: { id: practiceId, clubId },
    select: { id: true },
  });
  return !!existing;
}

/** Hydrate each item's graphics JSON with the SVG stored on the matching
 * DrillGraphic record, so the client can render thumbnails without
 * issuing additional requests. */
async function hydrateItemsGraphics<
  T extends { drillId: number | null; graphics: Prisma.JsonValue | null },
>(items: T[]): Promise<(T & { graphics: PracticeItemGraphicEntryHydrated[] | null })[]> {
  const graphicIds = new Set<number>();
  for (const it of items) {
    const entries = sanitiseGraphics(it.graphics) ?? [];
    for (const g of entries) graphicIds.add(g.drillGraphicId);
  }
  if (graphicIds.size === 0) {
    return items.map((it) => ({
      ...it,
      graphics: sanitiseGraphics(it.graphics),
    }));
  }
  const graphics = await prisma.drillGraphic.findMany({
    where: { id: { in: [...graphicIds] } },
    select: { id: true, svg: true },
  });
  const svgMap = new Map(graphics.map((g) => [g.id, g.svg]));
  return items.map((it) => {
    const entries = sanitiseGraphics(it.graphics);
    if (!entries) return { ...it, graphics: null };
    return {
      ...it,
      graphics: entries.map((e) => ({ ...e, svg: svgMap.get(e.drillGraphicId) })),
    };
  });
}

type PracticeItemGraphicEntryHydrated = PracticeItemGraphicEntry & { svg?: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const clubId = await getAuthClubId();
    if (clubId === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const practiceId = Number(id);
    if (!(await assertPracticeBelongsToClub(practiceId, clubId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const items = await prisma.practiceItem.findMany({
      where: { practiceId },
      orderBy: { order: 'asc' },
      include: { drill: { select: { id: true, name: true, svg: true } } },
    });
    const hydrated = await hydrateItemsGraphics(items);
    return NextResponse.json(hydrated);
  } catch (error) {
    log.error('Error fetching practice items:', error);
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const clubId = await getAuthClubId();
    if (clubId === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const practiceId = Number(id);
    if (!(await assertPracticeBelongsToClub(practiceId, clubId))) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const type: AllowedType = isAllowedType(body?.type) ? body.type : 'FREETEXT';
    const duration = Number.isFinite(Number(body?.duration))
      ? Math.max(0, Math.min(600, Math.round(Number(body.duration))))
      : 0;

    const last = await prisma.practiceItem.findFirst({
      where: { practiceId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = (last?.order ?? -1) + 1;

    const drillId = body?.drillId ? Number(body.drillId) : null;

    /* When the coach attaches a drill from their library, seed the
     * graphics overrides so every graphic of the drill is ready to be
     * toggled on for printing. The caption defaults to the original
     * drill graphic's notes so coaches don't have to retype common
     * instructions. */
    let graphicsValue: Prisma.InputJsonValue | typeof Prisma.JsonNull = Prisma.JsonNull;
    if (drillId) {
      const drillGraphics = await prisma.drillGraphic.findMany({
        where: { drillId },
        orderBy: { order: 'asc' },
        select: { id: true, notes: true },
      });
      if (drillGraphics.length > 0) {
        const seeded: PracticeItemGraphicEntry[] = drillGraphics.map((g) => ({
          drillGraphicId: g.id,
          caption: g.notes ?? '',
          printFirst: false,
          printOther: false,
        }));
        graphicsValue = seeded as unknown as Prisma.InputJsonValue;
      }
    } else if (body?.graphics !== undefined) {
      const sanitised = sanitiseGraphics(body.graphics);
      graphicsValue =
        sanitised && sanitised.length > 0
          ? (sanitised as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull;
    }

    const item = await prisma.practiceItem.create({
      data: {
        practiceId,
        type,
        order: nextOrder,
        duration,
        title: body?.title ?? null,
        text: body?.text ?? null,
        drillId,
        graphics: graphicsValue,
      },
      include: { drill: { select: { id: true, name: true, svg: true } } },
    });
    const [hydrated] = await hydrateItemsGraphics([item]);
    return NextResponse.json(hydrated, { status: 201 });
  } catch (error) {
    log.error('Error creating practice item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
