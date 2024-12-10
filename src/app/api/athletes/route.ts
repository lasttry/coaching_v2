import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET handler for fetching all athletes
export async function GET() {
  try {
    const athletes = await prisma.athletes.findMany();
    if (!athletes || athletes.length === 0) {
      return NextResponse.json({ error: "No atheltes found." }, { status: 404 });
    }
    return NextResponse.json(athletes);
  } catch (error) {
    console.log('Error fetching athletes:');
    console.log(error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST handler for creating a new athlete
export async function POST(request: Request) {
  const data = await request.json();

  try {
    const newAthlete = await prisma.athletes.create({
      data: {
        number: data.number,
        name: data.name,
        birthdate: new Date(data.birthdate),
        fpbNumber: data.fpbNumber ? Number(data.fpbNumber) : null, // Handle nullable integer
        idNumber: data.idNumber ? Number(data.idNumber) : null,   // Handle nullable integer
        idType: data.idType || null, // Handle nullable string
        active: data.active ?? true,
        createdAt: new Date(), // Set createdAt to current date
        updatedAt: new Date(), // Set updatedAt to current date
      },
    });
    return NextResponse.json(newAthlete);
  } catch (error) {
    console.error('Error creating athlete:', error);
    return NextResponse.json({ error: 'Error creating athlete' }, { status: 400 });
  }
}
