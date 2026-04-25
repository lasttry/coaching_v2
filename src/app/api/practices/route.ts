import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '../../../../generated/prisma';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';
import { sanitiseGraphics } from './[id]/items/route';
import { sanitisePracticeGroups } from '@/lib/practiceGroups';
import type { PracticeGroupsInterface } from '@/types/practices/types';

type WithItems<T> = T & {
  groups?: unknown;
  items: Array<{
    drillId: number | null;
    graphics: unknown;
    [k: string]: unknown;
  }>;
};

/** Replace each item's `graphics` JSON with a hydrated array that
 * includes the SVG of the original drill graphic. Keeps the single
 * practice endpoint and the list endpoint in sync. */
async function hydratePracticesGraphics<T extends WithItems<unknown>>(
  practices: T[]
): Promise<T[]> {
  const ids = new Set<number>();
  for (const p of practices) {
    for (const it of p.items ?? []) {
      const entries = sanitiseGraphics(it.graphics) ?? [];
      for (const e of entries) ids.add(e.drillGraphicId);
    }
  }
  const svgMap = new Map<number, string>();
  if (ids.size > 0) {
    const graphics = await prisma.drillGraphic.findMany({
      where: { id: { in: [...ids] } },
      select: { id: true, svg: true },
    });
    for (const g of graphics) svgMap.set(g.id, g.svg);
  }
  for (const p of practices) {
    for (const it of p.items ?? []) {
      const entries = sanitiseGraphics(it.graphics);
      it.graphics = entries
        ? entries.map((e) => ({ ...e, svg: svgMap.get(e.drillGraphicId) }))
        : null;
    }
    p.groups = sanitisePracticeGroups(p.groups);
  }
  return practices;
}

// GET /api/practices?from=ISO&to=ISO&teamId=1
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
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const teamIdParam = searchParams.get('teamId');

    const where: {
      clubId: number;
      teamId?: number;
      date?: { gte?: Date; lte?: Date };
    } = { clubId };

    if (teamIdParam) where.teamId = Number(teamIdParam);
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const practices = await prisma.practice.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
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
      },
    });

    const hydrated = await hydratePracticesGraphics(practices as unknown as WithItems<unknown>[]);
    return NextResponse.json(hydrated);
  } catch (error) {
    log.error('Error fetching practices:', error);
    return NextResponse.json({ error: 'Failed to fetch practices' }, { status: 500 });
  }
}

// POST /api/practices
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

    const body = await req.json();
    const {
      teamId,
      date,
      endTime,
      subtitle,
      topic,
      offensiveGoals,
      defensiveGoals,
      notes,
      completed,
      athletes,
      groups,
    } = body as {
      teamId?: number;
      date?: string;
      endTime?: string;
      subtitle?: string | null;
      topic?: string;
      offensiveGoals?: string | null;
      defensiveGoals?: string | null;
      notes?: string | null;
      completed?: boolean;
      athletes?: Array<{
        athleteId: number;
        attending: boolean;
        attended?: boolean | null;
        lateMinutes?: number | null;
        absenceReasonId?: number | null;
        absenceNotes?: string | null;
      }>;
      groups?: PracticeGroupsInterface | null;
    };

    if (!teamId || isNaN(Number(teamId))) {
      return NextResponse.json({ error: 'Team is required' }, { status: 400 });
    }
    if (!date || !endTime) {
      return NextResponse.json({ error: 'Date and end time are required' }, { status: 400 });
    }
    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: Number(teamId) },
      select: { id: true, clubId: true },
    });
    if (!team || team.clubId !== clubId) {
      return NextResponse.json({ error: 'Team does not belong to this club' }, { status: 400 });
    }

    const validAthleteIds = new Set<number>(
      (athletes ?? []).map((a) => Number(a.athleteId)).filter((n) => Number.isFinite(n) && n > 0)
    );
    const cleanedGroups = sanitisePracticeGroups(groups, validAthleteIds);

    const practice = await prisma.practice.create({
      data: {
        clubId,
        teamId: Number(teamId),
        date: new Date(date),
        endTime: new Date(endTime),
        subtitle: subtitle || null,
        topic: topic.trim(),
        offensiveGoals: offensiveGoals || null,
        defensiveGoals: defensiveGoals || null,
        notes: notes || null,
        completed: !!completed,
        groups: cleanedGroups
          ? (cleanedGroups as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        attendances:
          athletes && athletes.length > 0
            ? {
                create: athletes.map((a) => ({
                  athleteId: Number(a.athleteId),
                  attending: !!a.attending,
                  attended: a.attended === true || a.attended === false ? a.attended : null,
                  lateMinutes:
                    a.lateMinutes != null && Number.isFinite(Number(a.lateMinutes))
                      ? Math.max(0, Math.round(Number(a.lateMinutes)))
                      : null,
                  absenceReasonId: a.absenceReasonId != null ? Number(a.absenceReasonId) : null,
                  absenceNotes: a.absenceNotes?.trim() ? a.absenceNotes.trim() : null,
                })),
              }
            : undefined,
      },
      include: {
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
      },
    });

    const [hydrated] = await hydratePracticesGraphics([practice as unknown as WithItems<unknown>]);
    return NextResponse.json(hydrated, { status: 201 });
  } catch (error) {
    log.error('Error creating practice:', error);
    return NextResponse.json({ error: 'Failed to create practice' }, { status: 500 });
  }
}
