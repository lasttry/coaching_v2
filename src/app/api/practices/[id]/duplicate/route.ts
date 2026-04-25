import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

const practiceInclude = {
  team: {
    select: {
      id: true,
      name: true,
      echelon: { select: { id: true, name: true, gender: true } },
    },
  },
  attendances: {
    include: {
      athlete: { select: { id: true, name: true, number: true, photo: true } },
    },
  },
  items: {
    orderBy: { order: 'asc' },
    include: { drill: { select: { id: true, name: true, svg: true } } },
  },
} as const;

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
    const sourceId = Number(id);

    const source = await prisma.practice.findFirst({
      where: { id: sourceId, clubId },
      include: {
        attendances: true,
        items: { orderBy: { order: 'asc' } },
      },
    });
    if (!source) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const {
      date,
      endTime,
      teamId,
      copyItems = true,
      copyAttendance = true,
    } = body as {
      date?: string;
      endTime?: string;
      teamId?: number;
      copyItems?: boolean;
      copyAttendance?: boolean;
    };

    if (!date || !endTime) {
      return NextResponse.json({ error: 'Date and end time are required' }, { status: 400 });
    }

    let targetTeamId = source.teamId;
    if (teamId != null && Number(teamId) !== source.teamId) {
      const team = await prisma.team.findUnique({
        where: { id: Number(teamId) },
        select: { id: true, clubId: true },
      });
      if (!team || team.clubId !== clubId) {
        return NextResponse.json({ error: 'Team does not belong to this club' }, { status: 400 });
      }
      targetTeamId = team.id;
    }

    const duplicated = await prisma.practice.create({
      data: {
        clubId,
        teamId: targetTeamId,
        date: new Date(date),
        endTime: new Date(endTime),
        subtitle: source.subtitle,
        topic: source.topic,
        offensiveGoals: source.offensiveGoals,
        defensiveGoals: source.defensiveGoals,
        notes: source.notes,
        completed: false,
        groups:
          targetTeamId === source.teamId && source.groups != null
            ? (source.groups as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        attendances:
          copyAttendance && targetTeamId === source.teamId
            ? {
                create: source.attendances.map((a) => ({
                  athleteId: a.athleteId,
                  attending: a.attending,
                })),
              }
            : undefined,
        items: copyItems
          ? {
              create: source.items.map((it, idx) => ({
                order: idx,
                duration: it.duration,
                type: it.type,
                title: it.title,
                text: it.text,
                drillId: it.drillId,
                graphics: (it.graphics ?? undefined) as Prisma.InputJsonValue | undefined,
              })),
            }
          : undefined,
      },
      include: practiceInclude,
    });

    return NextResponse.json(duplicated, { status: 201 });
  } catch (error) {
    log.error('Error duplicating practice:', error);
    return NextResponse.json({ error: 'Failed to duplicate practice' }, { status: 500 });
  }
}
