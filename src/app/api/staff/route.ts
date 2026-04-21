import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { StaffInterface } from '@/types/staff/types';

const STAFF_ACCOUNT_SELECT = {
  id: true,
  name: true,
  email: true,
} as const;

// GET: List all staff for current club
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const staff = await prisma.staff.findMany({
      where: { clubId: session.user.selectedClubId },
      include: {
        account: { select: STAFF_ACCOUNT_SELECT },
        teams: {
          include: {
            team: {
              include: {
                echelon: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(staff);
  } catch (error) {
    log.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

/**
 * Verifies that `accountId` is allowed to be linked to a staff record in `clubId`.
 * Returns an error message if not allowed, otherwise null.
 *
 * Rules:
 * - accountId must belong to an Account that has an AccountClub entry for the same club.
 * - accountId must not be linked to any other Staff of the same club (unique constraint
 *   enforces this at DB level too, but we return a friendlier message).
 */
async function validateAccountLink(
  accountId: number,
  clubId: number,
  excludeStaffId?: number
): Promise<string | null> {
  const accountInClub = await prisma.accountClub.findUnique({
    where: { accountId_clubId: { accountId, clubId } },
    select: { id: true },
  });
  if (!accountInClub) {
    return 'Account does not belong to this club';
  }

  const conflict = await prisma.staff.findFirst({
    where: {
      clubId,
      accountId,
      ...(excludeStaffId ? { id: { not: excludeStaffId } } : {}),
    },
    select: { id: true, name: true },
  });
  if (conflict) {
    return `Account is already linked to staff "${conflict.name}"`;
  }

  return null;
}

// POST: Create a new staff member
export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = (await req.json()) as StaffInterface & { teamIds?: number[] };
    const clubId = session.user.selectedClubId;

    let accountId: number | null = null;
    if (data.accountId !== undefined && data.accountId !== null) {
      accountId = Number(data.accountId);
      if (Number.isNaN(accountId)) {
        return NextResponse.json({ error: 'Invalid accountId' }, { status: 400 });
      }
      const validationError = await validateAccountLink(accountId, clubId);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    const staff = await prisma.staff.create({
      data: {
        name: data.name,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        tptdNumber: data.tptdNumber,
        fpbLicense: data.fpbLicense,
        grade: data.grade,
        role: data.role,
        active: data.active ?? true,
        clubId,
        accountId,
        teams: data.teamIds
          ? {
              create: data.teamIds.map((teamId) => ({
                teamId,
                isPrimary: false,
              })),
            }
          : undefined,
      },
      include: {
        account: { select: STAFF_ACCOUNT_SELECT },
        teams: {
          include: {
            team: true,
          },
        },
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    log.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}
