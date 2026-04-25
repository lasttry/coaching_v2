import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

const drillInclude = {
  account: { select: { id: true, name: true, email: true } },
  echelon: { select: { id: true, name: true } },
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

type DrillFromDb = {
  topics: TopicLinkWithTopic[];
  [key: string]: unknown;
};

function serialize<T extends DrillFromDb>(drill: T) {
  const { topics, ...rest } = drill;
  return {
    ...rest,
    topics: topics.map((t) => t.topic),
  };
}

// GET /api/drills?search=&topicId=&echelonId=&type=FUNDAMENTAL|INDIVIDUAL|TEAM&position=GUARD|FORWARD|CENTER
export async function GET(req: NextRequest): Promise<NextResponse> {
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
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const topicIdParam = searchParams.get('topicId');
    const echelonIdParam = searchParams.get('echelonId');
    const typeParam = searchParams.get('type');
    const positionParam = searchParams.get('position');

    const where: Record<string, unknown> = { clubId };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (echelonIdParam) where.echelonId = Number(echelonIdParam);
    if (topicIdParam) {
      where.topics = { some: { topicId: Number(topicIdParam) } };
    }
    if (typeParam === 'FUNDAMENTAL') where.typeFundamental = true;
    else if (typeParam === 'INDIVIDUAL') where.typeIndividual = true;
    else if (typeParam === 'TEAM') where.typeTeam = true;
    if (positionParam === 'GUARD') where.posGuard = true;
    else if (positionParam === 'FORWARD') where.posForward = true;
    else if (positionParam === 'CENTER') where.posCenter = true;

    const drills = await prisma.drill.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: drillInclude,
    });

    return NextResponse.json(drills.map(serialize));
  } catch (error) {
    log.error('Error fetching drills:', error);
    return NextResponse.json({ error: 'Failed to fetch drills' }, { status: 500 });
  }
}

// POST /api/drills
export async function POST(req: NextRequest): Promise<NextResponse> {
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
    const accountId = session.user.id ? Number(session.user.id) : null;

    const body = await req.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const drill = await prisma.drill.create({
      data: {
        clubId,
        accountId,
        title,
        name: title,
        echelonId: body?.echelonId ? Number(body.echelonId) : null,
        description: body?.description ?? null,
        goals: body?.goals ?? null,
        variations: body?.variations ?? null,
        tips: body?.tips ?? null,
        defaultText: body?.defaultText ?? null,
        ballsCount: Number(body?.ballsCount ?? 0),
        basketsCount: Number(body?.basketsCount ?? 0),
        conesCount: Number(body?.conesCount ?? 0),
        extraEquipment: body?.extraEquipment ?? null,
        playersCount: Number(body?.playersCount ?? 0),
        coachesCount: Number(body?.coachesCount ?? 0),
        typeFundamental: !!body?.typeFundamental,
        typeIndividual: !!body?.typeIndividual,
        typeTeam: !!body?.typeTeam,
        posGuard: !!body?.posGuard,
        posForward: !!body?.posForward,
        posCenter: !!body?.posCenter,
      },
      include: drillInclude,
    });

    return NextResponse.json(serialize(drill), { status: 201 });
  } catch (error) {
    log.error('Error creating drill:', error);
    return NextResponse.json({ error: 'Failed to create drill' }, { status: 500 });
  }
}
