import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { StaffInterface } from '@/types/staff/types';

type Params = Promise<{ id: string }>;

const STAFF_ACCOUNT_SELECT = {
  id: true,
  name: true,
  email: true,
} as const;

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

// GET: Get a single staff member by ID
export async function GET(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await segmentData.params;
  const id = parseInt(params.id, 10);

  try {
    const staff = await prisma.staff.findUnique({
      where: { id },
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
    });

    if (!staff || staff.clubId !== session.user.selectedClubId) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error) {
    log.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// PUT: Update a staff member
export async function PUT(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await segmentData.params;
  const id = parseInt(params.id, 10);
  const clubId = session.user.selectedClubId;

  try {
    const data = (await req.json()) as StaffInterface & { teamIds?: number[] };

    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing || existing.clubId !== clubId) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    let accountId: number | null = null;
    const accountIdProvided = Object.prototype.hasOwnProperty.call(data, 'accountId');
    if (accountIdProvided) {
      if (data.accountId === null || data.accountId === undefined) {
        accountId = null;
      } else {
        accountId = Number(data.accountId);
        if (Number.isNaN(accountId)) {
          return NextResponse.json({ error: 'Invalid accountId' }, { status: 400 });
        }
        const validationError = await validateAccountLink(accountId, clubId, id);
        if (validationError) {
          return NextResponse.json({ error: validationError }, { status: 400 });
        }
      }
    }

    const staff = await prisma.$transaction(async (tx) => {
      await tx.teamStaff.deleteMany({ where: { staffId: id } });

      return tx.staff.update({
        where: { id },
        data: {
          name: data.name,
          birthdate: data.birthdate ? new Date(data.birthdate) : null,
          tptdNumber: data.tptdNumber,
          fpbLicense: data.fpbLicense,
          grade: data.grade,
          role: data.role,
          active: data.active,
          ...(accountIdProvided ? { accountId } : {}),
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
    });

    return NextResponse.json(staff);
  } catch (error) {
    log.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

// DELETE: Delete a staff member
export async function DELETE(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await segmentData.params;
  const id = parseInt(params.id, 10);

  try {
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing || existing.clubId !== session.user.selectedClubId) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    await prisma.staff.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
