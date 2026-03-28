import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';
import i18next from '@/lib/i18n.server'; // 👈 usa o i18n do servidor
import { AthleteInterface } from '@/types/athlete/types';

// GET handler for fetching all athletes
export async function GET(req: Request): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  try {
    const athletes = await prisma.athlete.findMany({
      include: {
        preferredNumbers: true, // 👈 includes all related venues
      },
    });
    if (!athletes || athletes.length === 0) {
      return NextResponse.json({ error: i18next.t('noAthletesFound') }, { status: 404 });
    }
    return NextResponse.json(athletes);
  } catch (error) {
    log.error('Failed to get athletes:', error);
    return NextResponse.json({ error: i18next.t('failedFetchAthletes') }, { status: 500 });
  }
}

// POST handler for creating a new athlete
export async function POST(req: Request): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);
  const data = (await req.json()) as AthleteInterface;
  const session = await auth();

  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (!session.user.selectedClubId || isNaN(Number(session.user.selectedClubId))) {
      throw new Error(i18next.t('invalidClubId'));
    }
    const newAthlete = await prisma.athlete.create({
      data: {
        number: data.number,
        name: data.name,
        birthdate: new Date(data.birthdate),
        fpbNumber: data.fpbNumber ? Number(data.fpbNumber) : null,
        idNumber: data.idNumber ? Number(data.idNumber) : null,
        idType: data.idType || null,
        active: data.active ?? true,
        clubId: Number(session.user.selectedClubId),
        shirtSize: data.shirtSize,
        preferredNumbers: data.preferredNumbers
          ? {
              create: data.preferredNumbers.map(
                (p: { number: string | number; preference?: string | number }, index: number) => ({
                  number: Number(p.number),
                  preference: p.preference ? Number(p.preference) : index + 1,
                })
              ),
            }
          : undefined,
      },
      include: {
        preferredNumbers: true,
      },
    });
    return NextResponse.json(newAthlete);
  } catch (error) {
    log.error('Failed to create athlete:', error);
    return NextResponse.json({ error: i18next.t('athleteCreateFailed') }, { status: 400 });
  }
}
