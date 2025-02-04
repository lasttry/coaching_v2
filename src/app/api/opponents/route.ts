import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST handler to create a new team
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const data = await request.json();

    const newTeam = await prisma.opponent.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        location: data.location,
        image: data.image, // Optional image field
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Error creating team' }, { status: 500 });
  }
}

// GET handler to fetch all Opponents
export async function GET(): Promise<NextResponse> {
  try {
    const Opponents = await prisma.opponent.findMany();
    return NextResponse.json(Opponents);
  } catch (error) {
    console.error('Error fetching Opponents:', error);
    return NextResponse.json({ error: 'Error fetching Opponents' }, { status: 500 });
  }
}
