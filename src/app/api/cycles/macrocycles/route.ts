import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: List all macrocycles
export async function GET() {
  try {
    const macrocycles = await prisma.macrocycle.findMany({
      include: {
        mesocycles: true, // Include related mesocycles
      },
    });

    return NextResponse.json(macrocycles);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch macrocycles' },
      { status: 500 },
    );
  }
}

// POST: Create a new macrocycle
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    const { name, number, startDate, endDate, notes } = data;
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 },
      );
    }

    const payload = {
      data: {
        name,
        number: Number(number),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
      },
    };
    console.log(payload);
    const newMacrocycle = await prisma.macrocycle.create(payload);

    return NextResponse.json(newMacrocycle, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to create macrocycle' },
      { status: 500 },
    );
  }
}
