import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    const payload = {
      data: {
        name: data.name,
        shortName: data.shortName,
        image: data.image ?? null,
        fpbClubId: data.fpbClubId ?? null,
        fpbTeamId: data.fpbTeamId ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        venues: {
          create: (data.venues || []).map((venue: { name: string }) => ({
            name: venue.name,
          })),
        },
      },
      include: {
        venues: true,
      },
    };
    const newOpponent = await prisma.opponent.create(payload);

    return NextResponse.json(newOpponent, { status: 201 });
  } catch (error) {
    log.error('Error creating opponent:', error);
    return NextResponse.json({ error: 'Error creating opponent' }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const opponents = await prisma.opponent.findMany({
      include: {
        venues: true,
      },
    });

    return NextResponse.json(opponents);
  } catch (error) {
    log.error('Error fetching opponents:', error);
    return NextResponse.json({ error: 'Error fetching opponents' }, { status: 500 });
  }
}
