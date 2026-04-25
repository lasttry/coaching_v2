import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';
import { Role } from '@prisma/client';

export interface MyClub {
  id: number;
  name: string;
  shortName: string | null;
  image: string | null;
  backgroundColor: string | null;
  foregroundColor: string | null;
  roles: Role[];
  isDefault: boolean;
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const accountId = Number(session.user.id);
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: {
        defaultClubId: true,
        clubs: {
          include: {
            club: {
              select: {
                id: true,
                name: true,
                shortName: true,
                image: true,
                backgroundColor: true,
                foregroundColor: true,
              },
            },
            roles: { select: { role: true } },
          },
        },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const defaultClubId = account.defaultClubId ?? 0;
    const clubs: MyClub[] = account.clubs
      .filter((ac) => !!ac.club)
      .map((ac) => ({
        id: ac.club.id,
        name: ac.club.name,
        shortName: ac.club.shortName,
        image: ac.club.image,
        backgroundColor: ac.club.backgroundColor,
        foregroundColor: ac.club.foregroundColor,
        roles: ac.roles.map((r) => r.role),
        isDefault: ac.club.id === defaultClubId,
      }))
      .sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ defaultClubId, clubs });
  } catch (error) {
    log.error('Failed to fetch my clubs:', error);
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 });
  }
}
