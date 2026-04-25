import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

/** Seed list used the first time a club reads its attendance reasons. The
 * stable `key` lets the UI show a localised label; admins can still
 * rename, reorder or delete them afterwards. */
const DEFAULT_REASONS: Array<{ key: string; name: string; order: number }> = [
  { key: 'injured', name: 'Injured', order: 10 },
  { key: 'sick', name: 'Sick', order: 20 },
  { key: 'excused', name: 'Excused', order: 30 },
  { key: 'school', name: 'School / Study', order: 40 },
  { key: 'family', name: 'Family reason', order: 50 },
  { key: 'work', name: 'Work', order: 60 },
  { key: 'personal', name: 'Personal', order: 70 },
  { key: 'unexcused', name: 'Unexcused', order: 80 },
  { key: 'other', name: 'Other', order: 90 },
];

/** Seed any missing default reasons so clubs already on the old
 * four-entry list automatically pick up the new ones. Idempotent thanks
 * to the unique `(clubId, key)` index + `skipDuplicates`. */
async function ensureReasonsForClub(clubId: number): Promise<void> {
  const existing = await prisma.clubAttendanceReason.findMany({
    where: { clubId, key: { in: DEFAULT_REASONS.map((r) => r.key) } },
    select: { key: true },
  });
  const existingKeys = new Set(existing.map((r) => r.key));
  const missing = DEFAULT_REASONS.filter((r) => !existingKeys.has(r.key));
  if (missing.length === 0) return;
  await prisma.clubAttendanceReason.createMany({
    data: missing.map((r) => ({ ...r, clubId })),
    skipDuplicates: true,
  });
}

async function resolveClubId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const clubId = Number(session.user.selectedClubId);
  return Number.isFinite(clubId) && clubId > 0 ? clubId : null;
}

async function isClubAdmin(accountId: number, clubId: number): Promise<boolean> {
  const membership = await prisma.accountClub.findUnique({
    where: { accountId_clubId: { accountId, clubId } },
    include: { roles: true },
  });
  return !!membership?.roles.some((r) => r.role === Role.ADMIN);
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clubId = await resolveClubId();
    if (!clubId) {
      return NextResponse.json({ error: 'No club selected' }, { status: 400 });
    }
    await ensureReasonsForClub(clubId);
    const reasons = await prisma.clubAttendanceReason.findMany({
      where: { clubId },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(reasons);
  } catch (error) {
    log.error('Error fetching attendance reasons:', error);
    return NextResponse.json({ error: 'Failed to fetch reasons' }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clubId = await resolveClubId();
    if (!clubId) {
      return NextResponse.json({ error: 'No club selected' }, { status: 400 });
    }
    const accountId = Number(session.user.id);
    if (!(await isClubAdmin(accountId, clubId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await req.json()) as { name?: string; order?: number };
    const name = (body.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const max = await prisma.clubAttendanceReason.aggregate({
      where: { clubId },
      _max: { order: true },
    });
    const nextOrder = Number.isFinite(body.order) ? Number(body.order) : (max._max.order ?? 0) + 10;

    const reason = await prisma.clubAttendanceReason.create({
      data: { clubId, name: name.slice(0, 120), order: nextOrder },
    });
    return NextResponse.json(reason, { status: 201 });
  } catch (error) {
    log.error('Error creating attendance reason:', error);
    return NextResponse.json({ error: 'Failed to create reason' }, { status: 500 });
  }
}
