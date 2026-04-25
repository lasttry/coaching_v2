import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

const drillInclude = {
  account: { select: { id: true, name: true, email: true } },
  echelon: { select: { id: true, name: true } },
  graphics: { orderBy: { order: 'asc' as const } },
  topics: {
    include: { topic: true },
  },
  _count: { select: { graphics: true } },
} as const;

type TopicLinkWithTopic = {
  topic: {
    id: number;
    clubId: number;
    key: string | null;
    name: string;
    order: number;
  };
};

function serialize<T extends { topics: TopicLinkWithTopic[] }>(drill: T) {
  const { topics, ...rest } = drill;
  return {
    ...rest,
    topics: topics.map((t) => t.topic),
  };
}

type DrillGuard =
  | { error: NextResponse; drill?: undefined }
  | { error?: undefined; drill: { id: number; clubId: number | null } };

async function assertClubDrill(drillId: number, clubId: number): Promise<DrillGuard> {
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
    if (isNaN(drillId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const drill = await prisma.drill.findUnique({
      where: { id: drillId },
      include: drillInclude,
    });
    if (!drill) return NextResponse.json({ error: 'Drill not found' }, { status: 404 });
    if (drill.clubId !== clubId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json(serialize(drill));
  } catch (error) {
    log.error('Error fetching drill:', error);
    return NextResponse.json({ error: 'Failed to fetch drill' }, { status: 500 });
  }
}

export async function PUT(
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
    if (isNaN(drillId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const guard = await assertClubDrill(drillId, clubId);
    if (guard.error) return guard.error;

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body?.title === 'string') {
      const title = body.title.trim();
      if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
      data.title = title;
      data.name = title;
    }
    if ('echelonId' in body) data.echelonId = body.echelonId ? Number(body.echelonId) : null;
    if ('description' in body) data.description = body.description ?? null;
    if ('goals' in body) data.goals = body.goals ?? null;
    if ('variations' in body) data.variations = body.variations ?? null;
    if ('tips' in body) data.tips = body.tips ?? null;
    if ('defaultText' in body) data.defaultText = body.defaultText ?? null;
    if ('ballsCount' in body) data.ballsCount = Number(body.ballsCount ?? 0);
    if ('basketsCount' in body) data.basketsCount = Number(body.basketsCount ?? 0);
    if ('conesCount' in body) data.conesCount = Number(body.conesCount ?? 0);
    if ('extraEquipment' in body) data.extraEquipment = body.extraEquipment ?? null;
    if ('playersCount' in body) data.playersCount = Number(body.playersCount ?? 0);
    if ('coachesCount' in body) data.coachesCount = Number(body.coachesCount ?? 0);
    if ('typeFundamental' in body) data.typeFundamental = !!body.typeFundamental;
    if ('typeIndividual' in body) data.typeIndividual = !!body.typeIndividual;
    if ('typeTeam' in body) data.typeTeam = !!body.typeTeam;
    if ('posGuard' in body) data.posGuard = !!body.posGuard;
    if ('posForward' in body) data.posForward = !!body.posForward;
    if ('posCenter' in body) data.posCenter = !!body.posCenter;

    await prisma.$transaction(async (tx) => {
      await tx.drill.update({ where: { id: drillId }, data });
      if (Array.isArray(body?.topicIds)) {
        const ids = (body.topicIds as unknown[]).map((v) => Number(v)).filter((n) => !isNaN(n));
        await tx.drillTopicLink.deleteMany({ where: { drillId } });
        if (ids.length > 0) {
          await tx.drillTopicLink.createMany({
            data: ids.map((topicId) => ({ drillId, topicId })),
            skipDuplicates: true,
          });
        }
      }
    });

    const drill = await prisma.drill.findUnique({
      where: { id: drillId },
      include: drillInclude,
    });
    return NextResponse.json(drill ? serialize(drill) : null);
  } catch (error) {
    log.error('Error updating drill:', error);
    return NextResponse.json({ error: 'Failed to update drill' }, { status: 500 });
  }
}

export async function DELETE(
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
    if (isNaN(drillId)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const guard = await assertClubDrill(drillId, clubId);
    if (guard.error) return guard.error;

    await prisma.drill.delete({ where: { id: drillId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error deleting drill:', error);
    return NextResponse.json({ error: 'Failed to delete drill' }, { status: 500 });
  }
}
