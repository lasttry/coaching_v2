import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const equipmentColors = await prisma.equipmentColor.findMany({
      where: {
        clubId: Number(session.user.selectedClubId),
      },
      select: {
        color: true,
        colorHex: true,
      },
      distinct: ['color'],
    });

    const colors = equipmentColors.map((e) => ({ color: e.color, colorHex: e.colorHex }));
    return NextResponse.json(colors);
  } catch (error) {
    log.error('Failed to fetch equipment colors:', error);
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
  }
}
