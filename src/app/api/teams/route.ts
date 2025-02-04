import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';
import i18next from '@/lib/i18next';

// GET: Retrieve all teams
export async function GET(req: NextRequest): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  try {
    const teams = await prisma.team.findMany({
      include: {
        club: true,
        echelon: true,
        athletes: { include: { athlete: true } },
      },
    });
    log.info('Teams fetched successfully:', teams);
    return NextResponse.json(teams);
  } catch (error) {
    log.error('Failed to fetch teams:', error);
    return NextResponse.json({ error: i18next.t('failedFetchTeams') }, { status: 500 });
  }
}

// POST: Create a new team
export async function POST(req: NextRequest): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);
  const session = await auth();

  if (!session?.user) return NextResponse.json({ status: 401 });

  try {
    if (!session.user.selectedClubId || isNaN(Number(session.user.selectedClubId))) {
      throw new Error(i18next.t('invalidClubId'));
    }
    const { name, type, echelonId } = await req.json();

    if (!name || !type || !echelonId) {
      log.error('Missing required fields');
      return NextResponse.json({ error: i18next.t('missingFields') }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: { name, type, clubId: session.user.selectedClubId, echelonId },
    });

    log.info('Team created successfully:', team);
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    log.error('Failed to create team:', error);
    return NextResponse.json({ error: i18next.t('teamCreateFailed') }, { status: 500 });
  }
}
