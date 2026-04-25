import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function PUT(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { clubId?: number };
    const clubId = Number(body.clubId);
    if (!Number.isFinite(clubId) || clubId <= 0) {
      return NextResponse.json({ error: 'Invalid clubId' }, { status: 400 });
    }

    const accountId = Number(session.user.id);

    const relation = await prisma.accountClub.findUnique({
      where: { accountId_clubId: { accountId, clubId } },
    });

    if (!relation) {
      return NextResponse.json({ error: 'You are not a member of this club' }, { status: 403 });
    }

    await prisma.account.update({
      where: { id: accountId },
      data: { defaultClubId: clubId },
    });

    return NextResponse.json({ defaultClubId: clubId });
  } catch (error) {
    log.error('Failed to set default club:', error);
    return NextResponse.json({ error: 'Failed to set default club' }, { status: 500 });
  }
}

export async function DELETE(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accountId = Number(session.user.id);
    await prisma.account.update({
      where: { id: accountId },
      data: { defaultClubId: 0 },
    });
    return NextResponse.json({ defaultClubId: 0 });
  } catch (error) {
    log.error('Failed to clear default club:', error);
    return NextResponse.json({ error: 'Failed to clear default club' }, { status: 500 });
  }
}
