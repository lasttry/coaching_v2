import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ClubInterface } from '@/types/club/types';
import { validateClubSettings } from '../assets/validateClub';

type Params = Promise<{ id: number }>;
// GET: Fetch club by ID
export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  try {
    const params = await segmentData.params;
    const clubId = Number(params.id);

    if (isNaN(clubId)) {
      return NextResponse.json({ error: 'Invalid club ID provided' }, { status: 400 });
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        venues: true,
      }
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    return NextResponse.json(club, { status: 200 });
  } catch (error) {
    console.error('Error fetching club settings:', error);
    return NextResponse.json({ error: 'Error fetching club settings.' }, { status: 500 });
  }
}

// DELETE: Delete a club by ID
export async function DELETE(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  try {
    const params = await segmentData.params;
    const clubId = Number(params.id);

    if (isNaN(clubId)) {
      return NextResponse.json({ error: 'Invalid club ID' }, { status: 400 });
    }

    // Delete the club from the database
    await prisma.club.delete({
      where: { id: clubId },
    });

    return NextResponse.json({ message: 'Club deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting club:', error);
    return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 });
  }
}

// PUT: Update club by ID
export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  try {
    const params = await segmentData.params;
    const clubId = Number(params.id);

    if (isNaN(clubId)) {
      return NextResponse.json({ error: 'Invalid club ID provided' }, { status: 400 });
    }

    const data: ClubInterface & { venues?: { name: string }[] } = await req.json();

    // Validate input data
    validateClubSettings(data);

    // Check for name conflict
    const existingClub = await prisma.club.findFirst({
      where: {
        name: data.name,
        NOT: { id: clubId },
      },
    });

    if (existingClub) {
      return NextResponse.json({ error: 'A club with this name already exists.' }, { status: 400 });
    }

    // Extract venues
    const { venues, ...clubData } = data;

    // Update the club with optional venues
    const updatedClub = await prisma.club.update({
      where: { id: clubId },
      data: {
        ...clubData,
        shortName: data.shortName || null,
        season: data.season || null,
        image: data.image || null,
        backgroundColor: data.backgroundColor || '#ffffff',
        foregroundColor: data.foregroundColor || '#000000',
        ...(venues && {
          venues: {
            deleteMany: { clubId }, // clears previous
            create: venues,
          },
        }),
      },
      include: {
        venues: true,
      },
    });

    return NextResponse.json(updatedClub, { status: 200 });
  } catch (error) {
    console.error('Error updating club settings:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error updating club settings.',
      },
      { status: 500 }
    );
  }
}
