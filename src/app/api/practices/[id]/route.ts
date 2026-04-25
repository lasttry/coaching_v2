import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '../../../../../generated/prisma';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';
import { sanitiseGraphics } from './items/route';
import { sanitisePracticeGroups } from '@/lib/practiceGroups';
import type { PracticeGroupsInterface } from '@/types/practices/types';

async function hydratePracticeGraphics<
  T extends {
    groups?: unknown;
    items: Array<{ graphics: unknown; [k: string]: unknown }>;
  },
>(practice: T): Promise<T> {
  const ids = new Set<number>();
  for (const it of practice.items ?? []) {
    const entries = sanitiseGraphics(it.graphics) ?? [];
    for (const e of entries) ids.add(e.drillGraphicId);
  }
  const svgMap = new Map<number, string>();
  if (ids.size > 0) {
    const graphics = await prisma.drillGraphic.findMany({
      where: { id: { in: [...ids] } },
      select: { id: true, svg: true },
    });
    for (const g of graphics) svgMap.set(g.id, g.svg);
  }
  for (const it of practice.items ?? []) {
    const entries = sanitiseGraphics(it.graphics);
    it.graphics = entries
      ? entries.map((e) => ({ ...e, svg: svgMap.get(e.drillGraphicId) }))
      : null;
  }
  practice.groups = sanitisePracticeGroups(practice.groups);
  return practice;
}

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
    include: {
      drill: { select: { id: true, name: true, svg: true } },
    },
  },
} as const;

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const clubId = await getAuthClubId();
    if (clubId === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const practice = await prisma.practice.findFirst({
      where: { id: Number(id), clubId },
      include: practiceInclude,
    });
    if (!practice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const hydrated = await hydratePracticeGraphics(
      practice as unknown as { items: Array<{ graphics: unknown }> }
    );
    return NextResponse.json(hydrated);
  } catch (error) {
    log.error('Error fetching practice:', error);
    return NextResponse.json({ error: 'Failed to fetch practice' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const clubId = await getAuthClubId();
    if (clubId === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const practiceId = Number(id);

    const existing = await prisma.practice.findFirst({
      where: { id: practiceId, clubId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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

    if (teamId != null) {
      const team = await prisma.team.findUnique({
        where: { id: Number(teamId) },
        select: { clubId: true },
      });
      if (!team || team.clubId !== clubId) {
        return NextResponse.json({ error: 'Team does not belong to this club' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (teamId != null) updateData.teamId = Number(teamId);
    if (date) updateData.date = new Date(date);
    if (endTime) updateData.endTime = new Date(endTime);
    if (subtitle !== undefined) updateData.subtitle = subtitle || null;
    if (topic !== undefined) updateData.topic = (topic || '').trim();
    if (offensiveGoals !== undefined) updateData.offensiveGoals = offensiveGoals || null;
    if (defensiveGoals !== undefined) updateData.defensiveGoals = defensiveGoals || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (completed !== undefined) updateData.completed = !!completed;

    if (groups !== undefined) {
      const validIds = new Set<number>(
        (athletes ?? []).map((a) => Number(a.athleteId)).filter((n) => Number.isFinite(n) && n > 0)
      );
      // When the request omits the roster, fall back to whatever is
      // already stored so we don't accidentally invalidate every player.
      let athleteIdSet: Set<number> | undefined;
      if (athletes && athletes.length > 0) {
        athleteIdSet = validIds;
      } else {
        const existingAthletes = await prisma.practiceAthlete.findMany({
          where: { practiceId },
          select: { athleteId: true },
        });
        athleteIdSet = new Set(existingAthletes.map((a) => a.athleteId));
      }
      const cleaned = sanitisePracticeGroups(groups, athleteIdSet);
      updateData.groups = cleaned ? (cleaned as unknown as Prisma.InputJsonValue) : Prisma.JsonNull;
    }

    await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.practice.update({ where: { id: practiceId }, data: updateData });
      }
      if (athletes) {
        await tx.practiceAthlete.deleteMany({ where: { practiceId } });
        if (athletes.length > 0) {
          await tx.practiceAthlete.createMany({
            data: athletes.map((a) => ({
              practiceId,
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
          });
        }
      }
    });

    const practice = await prisma.practice.findUnique({
      where: { id: practiceId },
      include: practiceInclude,
    });
    if (!practice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const hydrated = await hydratePracticeGraphics(
      practice as unknown as { items: Array<{ graphics: unknown }> }
    );
    return NextResponse.json(hydrated);
  } catch (error) {
    log.error('Error updating practice:', error);
    return NextResponse.json({ error: 'Failed to update practice' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const clubId = await getAuthClubId();
    if (clubId === null) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const practiceId = Number(id);
    const existing = await prisma.practice.findFirst({
      where: { id: practiceId, clubId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.practice.delete({ where: { id: practiceId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error deleting practice:', error);
    return NextResponse.json({ error: 'Failed to delete practice' }, { status: 500 });
  }
}
