import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST handler to create a new team
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newTeam = await prisma.teams.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        location: data.location,
        image: data.image,  // Optional image field
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

// GET handler to fetch all teams
export async function GET() {
  try {
    const teams = await prisma.teams.findMany();
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Error fetching teams' }, { status: 500 });
  }
}
