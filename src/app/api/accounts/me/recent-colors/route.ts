import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';

/** Shape of a single entry in the drill-editor recent-colours ring buffer. */
export interface RecentColor {
  color: string;
  pinned: boolean;
}

/** Absolute maximum entries stored per user. Pinned entries never age out,
 * while unpinned ones follow FIFO order when the list is full. */
const MAX_ENTRIES = 24;

function isHexColor(v: unknown): v is string {
  return typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}

function sanitize(input: unknown): RecentColor[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: RecentColor[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    if (!isHexColor(row.color)) continue;
    const key = (row.color as string).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      color: row.color as string,
      pinned: Boolean(row.pinned),
    });
    if (out.length >= MAX_ENTRIES) break;
  }
  return out;
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const account = await prisma.account.findUnique({
      where: { id: Number(session.user.id) },
      select: { drillRecentColors: true },
    });
    const colors = sanitize(account?.drillRecentColors);
    return NextResponse.json({ colors });
  } catch (error) {
    log.error('Failed to load recent colours:', error);
    return NextResponse.json({ error: 'Failed to load recent colours' }, { status: 500 });
  }
}

export async function PUT(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = (await req.json()) as { colors?: unknown };
    const colors = sanitize(body.colors);
    await prisma.account.update({
      where: { id: Number(session.user.id) },
      data: {
        drillRecentColors: colors as unknown as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({ colors });
  } catch (error) {
    log.error('Failed to save recent colours:', error);
    return NextResponse.json({ error: 'Failed to save recent colours' }, { status: 500 });
  }
}
