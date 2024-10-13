import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET handler for fetching a specific athlete by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
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
        return NextResponse.json(athlete);  // Return athlete data
      } else {
        return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });  // Return 404 if not found
      }
    } catch (error) {
      console.error('Error fetching athlete:', error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });  // Invalid ID
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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
      console.error('Error deleting athlete:', error);
      return NextResponse.json({ error: 'Error deleting athlete' }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }
}

// PUT handler for updating an athlete by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  // Ensure the ID is a valid number
  if (!id || isNaN(Number(id))) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    // Parse the request body
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.number || !data.birthdate) {
      return NextResponse.json({ error: 'Name, number, and birthdate are required.' }, { status: 400 });
    }

    // Convert birthdate to Date object (ensure valid date format)
    const birthdate = new Date(data.birthdate);
    if (isNaN(birthdate.getTime())) {
      return NextResponse.json({ error: 'Invalid birthdate format. It should be yyyy-MM-dd.' }, { status: 400 });
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
    console.error('Error updating athlete:', error);
    return NextResponse.json({ error: 'Error updating athlete' }, { status: 500 });
  }
}
