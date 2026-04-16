import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: string }>;

// GET: Get registration data for a team (athletes + staff)
export async function GET(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = await segmentData.params;
  const teamId = parseInt(params.id, 10);

  try {
    // Get team with echelon
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        echelon: true,
        club: true,
      },
    });

    if (!team || team.clubId !== session.user.selectedClubId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Get athletes for this team
    const teamAthletes = await prisma.teamAthlete.findMany({
      where: { teamId },
      include: {
        athlete: true,
      },
      orderBy: {
        athlete: {
          birthdate: 'asc',
        },
      },
    });

    // Get staff for this team
    const teamStaff = await prisma.teamStaff.findMany({
      where: { teamId },
      include: {
        staff: true,
      },
      orderBy: [{ isPrimary: 'desc' }, { staff: { name: 'asc' } }],
    });

    // Format the response
    const athletes = teamAthletes
      .filter((ta) => ta.athlete.active)
      .map((ta) => ({
        id: ta.athlete.id,
        name: ta.athlete.name,
        birthdate: ta.athlete.birthdate,
        fpbNumber: ta.athlete.fpbNumber,
        number: ta.athlete.number,
        photo: ta.athlete.photo,
      }));

    const staff = teamStaff
      .filter((ts) => ts.staff.active)
      .map((ts) => ({
        id: ts.staff.id,
        name: ts.staff.name,
        birthdate: ts.staff.birthdate,
        tptdNumber: ts.staff.tptdNumber,
        fpbLicense: ts.staff.fpbLicense,
        grade: ts.staff.grade,
        role: ts.staff.role,
        isPrimary: ts.isPrimary,
      }));

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        type: team.type,
        echelon: team.echelon,
        club: {
          id: team.club.id,
          name: team.club.name,
          shortName: team.club.shortName,
          image: team.club.image,
          federationLogo: team.club.federationLogo,
          backgroundColor: team.club.backgroundColor,
          foregroundColor: team.club.foregroundColor,
        },
      },
      athletes,
      staff,
    });
  } catch (error) {
    console.error('Error fetching registration data:', error);
    return NextResponse.json({ error: 'Failed to fetch registration data' }, { status: 500 });
  }
}
