import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

/** Seed list used the first time a club's topics are fetched. They get a
 * stable `key` so the UI can display a localised label; club admins can
 * still rename, reorder or delete them afterwards. */
const DEFAULT_TOPICS: Array<{ key: string; name: string; order: number }> = [
  { key: 'transition', name: 'Transition', order: 10 },
  { key: 'individual_position', name: 'Individual Position Training', order: 20 },
  { key: 'defence', name: 'Defence', order: 30 },
  { key: 'screens', name: 'Screens', order: 40 },
  { key: 'rebounding', name: 'Rebounding', order: 50 },
  { key: 'ballhandling', name: 'Ballhandling / Dribbling', order: 60 },
  { key: 'passing', name: 'Passing / Catching', order: 70 },
  { key: 'shooting', name: 'Shooting', order: 80 },
  { key: 'warmup', name: 'Warm Up', order: 90 },
  { key: 'conditioning', name: 'Basketball Conditioning', order: 100 },
  { key: 'mini', name: 'Mini Basketball', order: 110 },
  { key: 'little_games', name: 'Little Games', order: 120 },
];

async function ensureTopicsForClub(clubId: number): Promise<void> {
  const count = await prisma.drillTopic.count({ where: { clubId } });
  if (count > 0) return;
  await prisma.drillTopic.createMany({
    data: DEFAULT_TOPICS.map((t) => ({ ...t, clubId })),
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
    await ensureTopicsForClub(clubId);
    const topics = await prisma.drillTopic.findMany({
      where: { clubId },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json(topics);
  } catch (error) {
    log.error('Error fetching drill topics:', error);
    return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 });
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
    // New topics always get a fresh order above any existing entries, so
    // they land at the bottom of the list without the admin having to
    // micro-manage ordering just to add a category.
    const max = await prisma.drillTopic.aggregate({
      where: { clubId },
      _max: { order: true },
    });
    const nextOrder = Number.isFinite(body.order) ? Number(body.order) : (max._max.order ?? 0) + 10;

    const topic = await prisma.drillTopic.create({
      data: { clubId, name: name.slice(0, 120), order: nextOrder },
    });
    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    log.error('Error creating drill topic:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }
}
