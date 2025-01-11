import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: number }>;

// GET: Fetch accounts linked to a club by ID
export async function GET(req: NextRequest, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const clubId = Number(params.id);

    // Validate the club ID
    if (isNaN(clubId)) {
      return NextResponse.json(
        { error: 'Invalid club ID provided' },
        { status: 400 },
      );
    }

    // Fetch accounts linked to the given club
    const accounts = await prisma.account.findMany({
      where: {
        clubs: {
          some: {
            clubId: clubId, // Reference the relation field
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        clubs: {
          where: { clubId: clubId },
          select: {
            roles: true,
          },
        },
      },
    });

    // If no accounts are found, return an appropriate response
    if (!accounts || accounts.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Map accounts to include roles
    const accountsWithRoles = accounts.map((account) => ({
      ...account,
      roles: account.clubs.flatMap((club) =>
        club.roles.map((role) => role.role),
      ),
    }));

    // Return the linked accounts with roles
    return NextResponse.json(accountsWithRoles, { status: 200 });
  } catch (error) {
    console.error('Error fetching accounts for club:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching accounts.' },
      { status: 500 },
    );
  }
}

// POST: Link an account to a club with roles
export async function POST(req: NextRequest, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const clubId = Number(params.id);
    const { accountId, roles } = await req.json();

    // Validate input
    if (
      !accountId ||
      !clubId ||
      !roles ||
      !Array.isArray(roles) ||
      roles.length === 0
    ) {
      return NextResponse.json(
        { error: 'Account ID and roles are required' },
        { status: 400 },
      );
    }

    // Convert accountId and clubId to numbers
    const accountIdNumber = Number(accountId);
    const clubIdNumber = Number(clubId);

    // Validate the converted numbers
    if (isNaN(accountIdNumber) || isNaN(clubIdNumber)) {
      return NextResponse.json(
        { error: 'Account ID and club ID must be valid numbers' },
        { status: 400 },
      );
    }

    // Check if the account exists
    const account = await prisma.account.findUnique({
      where: { id: accountIdNumber },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Check if the club exists
    const club = await prisma.club.findUnique({
      where: { id: clubIdNumber },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    // Link the account to the club
    const accountClub = await prisma.accountClub.upsert({
      where: {
        accountId_clubId: {
          accountId: accountIdNumber,
          clubId: clubIdNumber,
        },
      },
      update: {},
      create: {
        accountId: accountIdNumber,
        clubId: clubIdNumber,
      },
    });

    console.log(roles)
    // Assign the roles to the account within the club
    const accountClubRoles = await prisma.$transaction(
      roles.map((role) =>
        prisma.accountClubRole.create({
          data: {
            accountClubId: accountClub.id,
            role: role.role,
          },
        }),
      ),
    );
    const accountsWithRoles = {
      ...account,
      roles: accountClubRoles.map((role) => role.role),
    };
    console.log(accountsWithRoles)
    return NextResponse.json(accountsWithRoles, { status: 201 });
  } catch (error) {
    console.error('Error linking account to club:', error);
    return NextResponse.json(
      { error: 'Failed to link account to club' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = parseInt(searchParams.get('clubId') || '', 10);
  const accountId = parseInt(searchParams.get('accountId') || '', 10);

  if (isNaN(clubId) || isNaN(accountId)) {
    return NextResponse.json(
      { error: 'Valid clubId and accountId are required' },
      { status: 400 },
    );
  }

  try {
    // Remove the account-club relationship
    await prisma.accountClub.deleteMany({
      where: {
        accountId,
        clubId,
      },
    });

    return NextResponse.json(
      { message: 'Account removed from club' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error removing account from club:', error);
    return NextResponse.json(
      { error: 'Failed to remove account from club' },
      { status: 500 },
    );
  }
}
