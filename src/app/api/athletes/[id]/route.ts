import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import i18next from '@/lib/i18n.server';

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
      const athlete = await prisma.athlete.findUnique({
        where: { id: Number(id) },
        include: {
          preferredNumbers: true,
        },
      });

      // If athlete is found, return the athlete details
      if (athlete) {
        return NextResponse.json(athlete); // Return athlete data
      } else {
        return NextResponse.json(
          { error: i18next.t('athlete.fetch.singleNotFound') },
          { status: 404 }
        ); // Return 404 if not found
      }
    } catch (error) {
      log.error('Error fetching athlete:', error);
      return NextResponse.json({ error: i18next.t('athlete.fetch.singleError') }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: i18next.t('athlete.validation.invalidId') }, { status: 400 }); // Invalid ID
  }
}

export async function DELETE(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const lng = req.headers.get('accept-language')?.split(',')[0] || 'pt';
  await i18next.changeLanguage(lng);

  const params = await segmentData.params;
  const id = params.id;

  if (id && !isNaN(Number(id))) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.gameAthlete.deleteMany({
          where: { athleteId: Number(id) },
        });
        await tx.athlete.delete({
          where: { id: Number(id) },
        });
      });

      return new NextResponse(null, { status: 204 });
    } catch (error) {
      log.error('Error deleting athlete:', error);
      return NextResponse.json({ error: i18next.t('athlete.save.deleteError') }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: i18next.t('athlete.validation.invalidId') }, { status: 400 });
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
    return NextResponse.json({ error: i18next.t('athlete.validation.invalidId') }, { status: 400 });
  }

  try {
    // Parse the request body
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.birthdate) {
      return NextResponse.json(
        { error: i18next.t('athlete.validation.requiredFields') },
        { status: 400 }
      );
    }

    // Convert birthdate to Date object (ensure valid date format)
    const birthdate = new Date(data.birthdate);
    if (isNaN(birthdate.getTime())) {
      return NextResponse.json(
        { error: i18next.t('athlete.validation.invalidBirthdate') },
        { status: 400 }
      );
    }

    // Normalize preferredNumbers from the payload (if provided)
    const rawPreferred = Array.isArray(data.preferredNumbers) ? data.preferredNumbers : [];

    const preferredNumbersData = rawPreferred
      .filter(
        (p: { color?: string; number?: number } | null | undefined) =>
          p && p.color && p.number !== undefined && p.number !== null
      )
      .map((p: { color: string; number: number }) => ({
        color: p.color,
        number: Number(p.number),
      }));

    // Get the athlete's clubId
    const athlete = await prisma.athlete.findUnique({
      where: { id: Number(id) },
      select: { clubId: true },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: i18next.t('athlete.fetch.singleNotFound') },
        { status: 404 }
      );
    }

    // Validate preferred numbers - check for duplicates per color in the club (excluding this athlete)
    for (const pref of preferredNumbersData) {
      const existing = await prisma.athletePreferredNumber.findFirst({
        where: {
          color: pref.color,
          number: pref.number,
          athlete: {
            clubId: athlete.clubId,
            id: { not: Number(id) },
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

    // Update the athlete in the database, including preferredNumbers
    const updatedAthlete = await prisma.athlete.update({
      where: { id: Number(id) },
      data: {
        number: data.number,
        name: data.name,
        birthdate: birthdate,
        fpbNumber: data.fpbNumber ? Number(data.fpbNumber) : null,
        idNumber: data.idNumber ? Number(data.idNumber) : null,
        shirtSize: data.shirtSize,
        idType: data.idType || null,
        photo: data.photo !== undefined ? data.photo : undefined,
        active: data.active ?? true, // Handle the `active` field if provided
        updatedAt: new Date(), // Automatically set the updatedAt field
        preferredNumbers: {
          // Remove all existing preferredNumbers for this athlete and recreate from payload
          deleteMany: {},
          ...(preferredNumbersData.length > 0
            ? {
                create: preferredNumbersData,
              }
            : {}),
        },
      },
      include: {
        preferredNumbers: true,
      },
    });

    // Return the updated athlete data
    return NextResponse.json(updatedAthlete, { status: 200 });
  } catch (error) {
    log.error('Error updating athlete:', error);
    return NextResponse.json({ error: i18next.t('athlete.save.updateError') }, { status: 500 });
  }
}
