import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import i18next from '@/lib/i18next';

type Params = Promise<{ id: string }>;
// GET handler for fetching a specific athlete by ID
export async function GET(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  const params = await segmentData.params;
  const id = params.id;

  // Ensure the ID is a valid number
  if (id && !isNaN(Number(id))) {
    try {
      // Find the athlete by ID
      const athlete = await prisma.athletes.findUnique({
        where: { id: Number(id) },
      });

      // If athlete is found, return the athlete details
      if (athlete) {
        return NextResponse.json(athlete); // Return athlete data
      } else {
        return NextResponse.json({ error: i18next.t('athleteNotFound') }, { status: 404 }); // Return 404 if not found
      }
    } catch (error) {
      log.error('Error fetching athlete:', error);
      return NextResponse.json({ error: i18next.t('failedFetchAthlete') }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: i18next.t('invalidAthleteId') }, { status: 400 }); // Invalid ID
  }
}

export async function DELETE(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  const params = await segmentData.params;
  const id = params.id;

  if (id && !isNaN(Number(id))) {
    try {
      // First, delete all related gameAthletes records
      await prisma.gameAthletes.deleteMany({
        where: { athleteId: Number(id) },
      });

      // Then, delete the athlete
      await prisma.athletes.delete({
        where: { id: Number(id) },
      });

      // Return 204 No Content (no body)
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      log.error('Error deleting athlete:', error);
      return NextResponse.json({ error: i18next.t('failedDeleteAthlete') }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: i18next.t('invalidAthleteId') }, { status: 400 });
  }
}

// PUT handler for updating an athlete by ID
export async function PUT(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  const params = await segmentData.params;
  const id = params.id;

  // Ensure the ID is a valid number
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: i18next.t('invalidAthleteId') }, { status: 400 });
  }

  try {
    // Parse the request body
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.birthdate) {
      return NextResponse.json(
        { error: i18next.t('requiredNameNumberBirthdate') },
        { status: 400 }
      );
    }

    // Convert birthdate to Date object (ensure valid date format)
    const birthdate = new Date(data.birthdate);
    if (isNaN(birthdate.getTime())) {
      return NextResponse.json({ error: i18next.t('invalidBirthdate') }, { status: 400 });
    }

    // Update the athlete in the database
    const updatedAthlete = await prisma.athletes.update({
      where: { id: Number(id) },
      data: {
        number: data.number,
        name: data.name,
        birthdate: birthdate,
        fpbNumber: data.fpbNumber ? Number(data.fpbNumber) : null,
        idNumber: data.idNumber ? Number(data.idNumber) : null,
        idType: data.idType || null,
        active: data.active ?? true, // Handle the `active` field if provided
        updatedAt: new Date(), // Automatically set the updatedAt field
      },
    });

    // Return the updated athlete data
    return NextResponse.json(updatedAthlete, { status: 200 });
  } catch (error) {
    log.error('Error updating athlete:', error);
    return NextResponse.json({ error: i18next.t('athleteUpdateFailed') }, { status: 500 });
  }
}
