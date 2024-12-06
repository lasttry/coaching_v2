import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: List all mesocycles
export async function GET() {
  try {
    const mesocycles = await prisma.mesocycle.findMany({
      include: {
        microcycles: true, // Include related microcycles
        macrocycle: true,  // Include parent macrocycle
      },
    });

    return NextResponse.json(mesocycles);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch mesocycles" }, { status: 500 });
  }
}

// POST: Create a new mesocycle
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    const { name, number, startDate, endDate, notes, macrocycleId } = data;
    if (!startDate || !endDate || !macrocycleId) {
      return NextResponse.json(
        { error: "Start date, end date, and macrocycle ID are required" },
        { status: 400 }
      );
    }

    const newMesocycle = await prisma.mesocycle.create({
      data: {
        name,
        number: Number(number),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
        macrocycleId,
      },
    });

    return NextResponse.json(newMesocycle, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create mesocycle" }, { status: 500 });
  }
}
