import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

type Params = Promise<{ id: string }>;

async function requireAdminForTopic(
  topicId: number
): Promise<{ error: NextResponse } | { ok: true; clubId: number; accountId: number }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const topic = await prisma.drillTopic.findUnique({
    where: { id: topicId },
    select: { id: true, clubId: true },
  });
  if (!topic) {
    return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  }
  const accountId = Number(session.user.id);
  const membership = await prisma.accountClub.findUnique({
    where: { accountId_clubId: { accountId, clubId: topic.clubId } },
    include: { roles: true },
  });
  if (!membership?.roles.some((r) => r.role === Role.ADMIN)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { ok: true, clubId: topic.clubId, accountId };
}

export async function PUT(req: Request, { params }: { params: Params }): Promise<NextResponse> {
  try {
    const { id } = await params;
    const topicId = Number(id);
    if (!Number.isFinite(topicId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const guard = await requireAdminForTopic(topicId);
    if ('error' in guard) return guard.error;

    const body = (await req.json()) as { name?: string; order?: number };
    const data: { name?: string; order?: number } = {};
    if (typeof body.name === 'string') {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      data.name = name.slice(0, 120);
    }
    if (typeof body.order === 'number' && Number.isFinite(body.order)) {
      data.order = body.order;
    }

    const topic = await prisma.drillTopic.update({
      where: { id: topicId },
      data,
    });
    return NextResponse.json(topic);
  } catch (error) {
    log.error('Error updating drill topic:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Params }): Promise<NextResponse> {
  try {
    const { id } = await params;
    const topicId = Number(id);
    if (!Number.isFinite(topicId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const guard = await requireAdminForTopic(topicId);
    if ('error' in guard) return guard.error;

    await prisma.drillTopic.delete({ where: { id: topicId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error('Error deleting drill topic:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }
}
