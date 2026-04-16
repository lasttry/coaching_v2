import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ClubInterface } from '@/types/club/types';
import { validateClubSettings } from '../assets/validateClub';
import { VenueInterface } from '@/types/venues/types';
import { log } from '@/lib/logger';

type Params = Promise<{ clubId: string }>;
// GET: Fetch club by ID
export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  try {
    const params = await segmentData.params;
    const clubId = Number(params.clubId);

    if (isNaN(clubId)) {
      return NextResponse.json({ error: 'Invalid club ID provided' }, { status: 400 });
    }

    const club = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        venues: true,
      },
    });

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    return NextResponse.json(club, { status: 200 });
  } catch (error) {
    log.error('Error fetching club settings:', error);
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
    const clubId = Number(params.clubId);

    if (isNaN(clubId)) {
      return NextResponse.json({ error: 'Invalid club ID' }, { status: 400 });
    }

    // Delete the club from the database
    await prisma.club.delete({
      where: { id: clubId },
    });

    return NextResponse.json({ message: 'Club deleted successfully' }, { status: 200 });
  } catch (error) {
    log.error('Error deleting club:', error);
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
    const clubId = Number(params.clubId);

    if (isNaN(clubId)) {
      return NextResponse.json({ error: 'Invalid club ID provided' }, { status: 400 });
    }

    const data: ClubInterface & { venues?: VenueInterface[] } = await req.json();

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

    // Extract venues from payload and ignore fields that cannot be updated directly on Club
    const {
      venues,
      equipments: _equipments,
      id: _ignoredId,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...clubPayload
    } = data;

    // Build the update payload explicitly with only scalar fields that exist on the Club model
    const updateData: Record<string, unknown> = {
      name: clubPayload.name,
      shortName: clubPayload.shortName || null,
      image: clubPayload.image || null,
      federationLogo: clubPayload.federationLogo || null,
      backgroundColor: clubPayload.backgroundColor || '#ffffff',
      foregroundColor: clubPayload.foregroundColor || '#000000',
    };

    // First, update the club itself (without nested venues write)
    await prisma.club.update({
      where: { id: clubId },
      data: updateData,
    });

    // Then handle venues explicitly: update existing by id or create new ones.
    if (venues && venues.length > 0) {
      for (const v of venues) {
        const venueData = {
          name: v.name,
          address: v.address ?? null,
          clubId,
        };

        if (v.id) {
          // Update existing venue (preserves game->venue links)
          await prisma.venue.update({
            where: { id: v.id },
            data: venueData,
          });
        } else {
          // Create new venue for this club
          await prisma.venue.create({
            data: venueData,
          });
        }
      }
    }

    // Finally, fetch the updated club with venues and return
    const updatedClubWithVenues = await prisma.club.findUnique({
      where: { id: clubId },
      include: {
        venues: true,
      },
    });

    return NextResponse.json(updatedClubWithVenues, { status: 200 });
  } catch (error) {
    log.error('Error updating club settings:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error updating club settings.',
      },
      { status: 500 }
    );
  }
}
