import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

import { parseHashedPassword, hashPassword, validatePassword } from '@/lib/password';

type Params = Promise<{ id: number }>;

export async function DELETE(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  try {
    // Extract account ID from segment data
    const params = await segmentData.params;
    const accountId = Number(params.id);

    // Validate account ID
    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'A valid account ID is required.' }, { status: 400 });
    }

    // Check if account exists
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    // Delete the account
    await prisma.account.delete({
      where: { id: accountId },
    });

    // Return success response
    return NextResponse.json({ message: 'Account deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the account.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const params = await segmentData.params;
  const accountId = Number(params.id);
  const accountObject = await req.json();
  const { name, email, defaultClubId, image, password, oldPassword } = accountObject;

  const updateData: Partial<Prisma.AccountUpdateInput> = {};

  // Check if the old password is provided and needs to be verified
  if (oldPassword) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    // Verify the old password
    const isOldPasswordValid = await validatePassword(oldPassword, account.password);
    if (!isOldPasswordValid) {
      return NextResponse.json({ error: 'Old password is incorrect' }, { status: 400 });
    }
    // Check if the new password is provided and needs to be hashed
    if (password && !parseHashedPassword(password)) {
      updateData.password = await hashPassword(password);
    }
  }
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  updateData.defaultClubId = defaultClubId;
  if (image) updateData.image = image;
  // Update the account with the new data
  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: updateData,
  });

  return NextResponse.json(updatedAccount, { status: 200 });
}

export async function GET(
  request: Request,
  segmentData: { params: Params }
): Promise<NextResponse> {
  try {
    const params = await segmentData.params;
    const accountId = Number(params.id);

    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    // Fetch the account by ID with related clubs and roles
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        clubs: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                shortName: true,
              },
            },
            roles: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account, { status: 200 });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}
