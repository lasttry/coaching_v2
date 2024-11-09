import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
type Params = Promise<{ id: number }>;

// GET handler for fetching a team by ID
export async function GET(request: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const id = params.id;

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid Macrocycle ID" },
      { status: 400 },
    );
  }

  try {
    const mesocycle = await prisma.mesocycle.findUnique({
      where: { macrocycle: id },
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
