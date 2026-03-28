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
        preferredNumbers: true,
      },
    });
    return NextResponse.json(athletes ?? []);
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

    const clubId = Number(session.user.selectedClubId);

    // Validate preferred numbers - check for duplicates per color in the club
    if (data.preferredNumbers?.length) {
      for (const pref of data.preferredNumbers) {
        const existing = await prisma.athletePreferredNumber.findFirst({
          where: {
            color: pref.color,
            number: Number(pref.number),
            athlete: {
              clubId: clubId,
            },
          },
          include: {
            athlete: true,
          },
        });
        if (existing) {
          return NextResponse.json(
            {
              error: i18next.t('preferredNumberDuplicate', {
                number: pref.number,
                color: pref.color,
                athlete: existing.athlete.name,
              }),
            },
            { status: 400 }
          );
        }
      }
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
        clubId: clubId,
        shirtSize: data.shirtSize,
        preferredNumbers: data.preferredNumbers?.length
          ? {
              create: data.preferredNumbers.map(
                (p: { color: string; number: string | number }) => ({
                  color: p.color,
                  number: Number(p.number),
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
