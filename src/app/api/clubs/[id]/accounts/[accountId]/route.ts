import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

type Params = Promise<{ id: number; accountId: number }>;

// PUT: Add/Remove a role of an account from a club
export async function PUT(req: NextRequest, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const clubId = Number(params.id);
    const accountId = Number(params.accountId);
    const { role, checked } = await req.json();

    if (!role || typeof checked !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const accountClub = await prisma.accountClub.findUnique({
      where: {
        accountId_clubId: {
          accountId: Number(accountId),
          clubId: clubId,
        },
      },
    });

    if (!accountClub) {
      return NextResponse.json(
        { error: 'Account not found in the club' },
        { status: 404 },
      );
    }

    if (checked) {
      await prisma.accountClubRole.create({
        data: {
          accountClubId: accountClub.id,
          role,
        },
      });
    } else {
      await prisma.accountClubRole.deleteMany({
        where: {
          accountClubId: accountClub.id,
          role,
        },
      });
    }

    return NextResponse.json(
      { message: 'Role updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the role.' },
      { status: 500 },
    );
  }
}

// DELETE: Remove an account from a club
export async function DELETE(
  req: NextRequest,
  segmentData: { params: Params },
) {
  try {
    const session = await auth();

    console.log(session);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const params = await segmentData.params;
    const clubId = Number(params.id);
    const accountId = Number(params.accountId);

    // Check if the user is trying to remove themselves
    if (Number(accountId) === Number(currentUserId)) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the club.' },
        { status: 400 },
      );
    }

    // Check if the account to be removed is the last account in the club
    const accountCount = await prisma.accountClub.count({
      where: {
        clubId: clubId,
      },
    });

    if (accountCount <= 1) {
      return NextResponse.json(
        { error: 'You cannot remove the last account from the club.' },
        { status: 400 },
      );
    }

    await prisma.accountClub.delete({
      where: {
        accountId_clubId: {
          accountId: Number(accountId),
          clubId: clubId,
        },
      },
    });

    return NextResponse.json(
      { message: 'Account removed from the club successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error removing account from the club:', error);
    return NextResponse.json(
      { error: 'An error occurred while removing the account from the club.' },
      { status: 500 },
    );
  }
}

// POST: Add an account to a club
export async function POST(req: NextRequest, segmentData: { params: Params }) {
  try {
    const params = await segmentData.params;
    const clubId = Number(params.id);
    const { email } = await req.json();

    const account = await prisma.account.findUnique({
      where: { email },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    await prisma.accountClub.create({
      data: {
        accountId: account.id,
        clubId: clubId,
      },
    });

    return NextResponse.json(
      { message: 'Account added to the club successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error adding account to the club:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding the account to the club.' },
      { status: 500 },
    );
  }
}
