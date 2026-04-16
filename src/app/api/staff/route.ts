import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StaffInterface } from '@/types/staff/types';

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
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST: Create a new staff member
export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = (await req.json()) as StaffInterface & { teamIds?: number[] };

    const staff = await prisma.staff.create({
      data: {
        name: data.name,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        tptdNumber: data.tptdNumber,
        fpbLicense: data.fpbLicense,
        grade: data.grade,
        role: data.role,
        active: data.active ?? true,
        clubId: session.user.selectedClubId,
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

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}
