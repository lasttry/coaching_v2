import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data || typeof data !== 'object') {
      console.error("Invalid data format:", data);
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }


    const newMesocycle = await prisma.mesocycle.create({
      data: {
        number: Number(data.number),
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes,
        macrocycleId: data.macrocycleId
      },
    });

    // Return the created macrocycle in JSON format
    return NextResponse.json(newMesocycle, { status: 201 });
  } catch (error) {
    console.error("Error creating mesocycle:", error);

    return NextResponse.json(
      { error: "Error creating mesocycle" },
      { status: 500 }
    );
  }
}

// GET handler for fetching a team by ID
export async function GET() {

  try {
    const mesocycle = await prisma.mesocycle.findMany({
    });

    if (!mesocycle) {
      return NextResponse.json(
        { error: "Mesocycles not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(mesocycle);
  } catch (error) {
    console.error("Error fetching mesocycles:", error);
    return NextResponse.json(
      { error: "Error fetching mesocycle" },
      { status: 500 },
    );
  }
}
