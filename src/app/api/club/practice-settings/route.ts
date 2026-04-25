import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

type AttendanceDefault = 'ALL' | 'NONE';

function normalizeAttendance(v: unknown): AttendanceDefault | undefined {
  if (v === 'ALL' || v === 'NONE') return v;
  return undefined;
}

export async function GET(): Promise<NextResponse> {
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

    const settings = await prisma.clubPracticeSettings.upsert({
      where: { clubId },
      create: { clubId },
      update: {},
    });
    return NextResponse.json(settings);
  } catch (error) {
    log.error('Error fetching practice settings:', error);
    return NextResponse.json({ error: 'Failed to fetch practice settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
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

    const male = normalizeAttendance(body.defaultAttendanceMale);
    const female = normalizeAttendance(body.defaultAttendanceFemale);
    const coed = normalizeAttendance(body.defaultAttendanceCoed);

    const updated = await prisma.clubPracticeSettings.upsert({
      where: { clubId },
      create: {
        clubId,
        ...(male && { defaultAttendanceMale: male }),
        ...(female && { defaultAttendanceFemale: female }),
        ...(coed && { defaultAttendanceCoed: coed }),
      },
      update: {
        ...(male && { defaultAttendanceMale: male }),
        ...(female && { defaultAttendanceFemale: female }),
        ...(coed && { defaultAttendanceCoed: coed }),
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    log.error('Error updating practice settings:', error);
    return NextResponse.json({ error: 'Failed to update practice settings' }, { status: 500 });
  }
}
