import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StaffInterface } from '@/types/staff/types';

type Params = Promise<{ id: string }>;

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
    console.error('Error fetching staff:', error);
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

  try {
    const data = (await req.json()) as StaffInterface & { teamIds?: number[] };

    // Verify staff belongs to club
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing || existing.clubId !== session.user.selectedClubId) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Update staff and manage team associations
    const staff = await prisma.$transaction(async (tx) => {
      // Delete existing team associations
      await tx.teamStaff.deleteMany({ where: { staffId: id } });

      // Update staff with new team associations
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
    console.error('Error updating staff:', error);
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
    // Verify staff belongs to club
    const existing = await prisma.staff.findUnique({ where: { id } });
    if (!existing || existing.clubId !== session.user.selectedClubId) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    await prisma.staff.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
