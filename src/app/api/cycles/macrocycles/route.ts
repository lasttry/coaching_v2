import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST handler to create a new team
export async function POST(request: Request) {
  try {
    const data = await request.json();

    const newTeam = await prisma.macroCiclo.create({
      data: {
        startDate: data.startDate,
        endDate: data.endDate,
        notes: data.notes,
      },
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json({ error: "Error creating team" }, { status: 500 });
  }
}

// GET handler to fetch all teams
export async function GET() {
  try {
    const macroCiclos = await prisma.macroCiclo.findMany();
    return NextResponse.json(macroCiclos);
  } catch (error) {
    console.error("Error fetching Macrociclos:", error);
    return NextResponse.json(
      { error: "Error fetching Macrociclos" },
      { status: 500 },
    );
  }
}
