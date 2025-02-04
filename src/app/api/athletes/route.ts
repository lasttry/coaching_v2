import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';
import i18next from '@/lib/i18next';

// GET handler for fetching all athletes
export async function GET(req: Request): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  try {
    const athletes = await prisma.athletes.findMany();
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
  const data = await req.json();
  const session = await auth();

  if (!session?.user) return null;

  try {
    if (!session.user.selectedClubId || isNaN(Number(session.user.selectedClubId))) {
      throw new Error(i18next.t('invalidClubId'));
    }
    const newAthlete = await prisma.athletes.create({
      data: {
        number: data.number,
        name: data.name,
        birthdate: new Date(data.birthdate),
        fpbNumber: data.fpbNumber ? Number(data.fpbNumber) : null, // Handle nullable integer
        idNumber: data.idNumber ? Number(data.idNumber) : null, // Handle nullable integer
        idType: data.idType || null, // Handle nullable string
        active: data.active ?? true,
        createdAt: new Date(), // Set createdAt to current date
        updatedAt: new Date(), // Set updatedAt to current date
        clubId: session.user.selectedClubId,
      },
    });
    return NextResponse.json(newAthlete);
  } catch (error) {
    log.error('Failed to create athlete:', error);
    return NextResponse.json({ error: i18next.t('athleteCreateFailed') }, { status: 400 });
  }
}
