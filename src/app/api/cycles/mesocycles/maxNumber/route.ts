import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const maxNumber = await prisma.mesocycle.aggregate({
      _max: {
        number: true,
      },
    });
    return NextResponse.json({ maxNumber: maxNumber._max.number  === null ? 0 : maxNumber._max.number });
  } catch (error) {
    console.error("Error fetching max number from mesocycles:", error);
    return NextResponse.json(
      { error: "Failed to retrieve max number" },
      { status: 500 },
    );
  }
}
