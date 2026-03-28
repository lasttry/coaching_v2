import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { parseHashedPassword, hashPassword, validatePassword } from '@/lib/password';
import { log } from '@/lib/logger';

// ✅ Correct param type for Next.js 14+
type Params = Promise<{ id: string }>;

export async function DELETE(
  _req: NextRequest,
  context: { params: Params }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const accountId = parseInt(id, 10);

    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'A valid account ID is required.' }, { status: 400 });
    }

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    await prisma.account.delete({ where: { id: accountId } });
    return NextResponse.json({ message: 'Account deleted successfully.' }, { status: 200 });
  } catch (error) {
    log.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the account.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: { params: Params }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const accountId = parseInt(id, 10);

    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    const accountObject = await req.json();
    const { name, email, defaultClubId, image, password, oldPassword } = accountObject;

    const updateData: Partial<Prisma.AccountUpdateInput> = {};

    // ✅ Password update logic
    if (oldPassword) {
      const account = await prisma.account.findUnique({ where: { id: accountId } });
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }

      const isOldPasswordValid = await validatePassword(oldPassword, account.password);
      if (!isOldPasswordValid) {
        return NextResponse.json({ error: 'Old password is incorrect' }, { status: 400 });
      }

      if (password && !parseHashedPassword(password)) {
        updateData.password = await hashPassword(password);
      }
    }

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (image) updateData.image = image;
    if (defaultClubId !== undefined) updateData.defaultClubId = defaultClubId;

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: updateData,
    });

    return NextResponse.json(updatedAccount, { status: 200 });
  } catch (error) {
    log.error('Error updating account:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, context: { params: Params }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const accountId = parseInt(id, 10);

    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

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
    log.error('Error fetching account:', error);
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}
