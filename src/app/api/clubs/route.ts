import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ClubInterface } from '@/types/club/types';
import { validateClubSettings } from './assets/validateClub';

// GET: Fetch all clubs
export async function GET(): Promise<NextResponse> {
  try {
    const clubs = await prisma.club.findMany({
      include: {
        venues: true, // 👈 includes all related venues
      },
    });

    if (!clubs || clubs.length === 0) {
      return NextResponse.json({ error: 'No clubs found.' }, { status: 404 });
    }

    return NextResponse.json(clubs, { status: 200 });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Error fetching clubs.' }, { status: 500 });
  }
}
// POST: Create a new club
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const data: ClubInterface & { venues?: { name: string }[] } = await request.json();

    // Validate input data
    validateClubSettings(data);

    // Remove the id field if it is 0 to allow autogeneration
    if (data.id === 0) {
      delete data.id;
    }

    // Check if a club with the same name already exists
    const existingClub = await prisma.club.findUnique({
      where: { name: data.name },
    });

    if (existingClub) {
      return NextResponse.json(
        { error: 'Club with this name already exists' },
        { status: 409 }
      );
    }

    // Separate venues and club data
    const { venues, ...clubData } = data;

    // Create the new club with optional venues
    const newClub = await prisma.club.create({
      data: {
        ...clubData,
        ...(venues && venues.length > 0 && {
          venues: {
            create: venues,
          },
        }),
      },
      include: {
        venues: true,
      },
    });

    return NextResponse.json(newClub, { status: 201 });
  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json({ error: 'Failed to create club' }, { status: 500 });
  }
}
