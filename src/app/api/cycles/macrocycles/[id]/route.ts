import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET handler for fetching a team by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid macrociclo ID" },
      { status: 400 },
    );
  }

  try {
    const macroCiclo = await prisma.macroCiclo.findUnique({
      where: { id },
    });

    if (!macroCiclo) {
      return NextResponse.json(
        { error: "Macrociclo not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(macroCiclo);
  } catch (error) {
    console.error("Error fetching Macrociclo:", error);
    return NextResponse.json(
      { error: "Error fetching Macrociclo" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid macrociclo ID" },
      { status: 400 },
    );
  }

  try {
    const data = await request.json();

    const updatedMacrociclo = await prisma.macroCiclo.update({
      where: { id },
      data: {
        notes: data.notes,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    return NextResponse.json(updatedMacrociclo, { status: 200 });
  } catch (error) {
    console.error("Error updating macrociclo:", error);
    return NextResponse.json(
      { error: "Error updating macrociclo" },
      { status: 500 },
    );
  }
}

// DELETE handler for deleting a team
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid macrociclo ID" },
      { status: 400 },
    );
  }

  try {
    await prisma.macroCiclo.delete({
      where: { id },
    });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error("Error deleting macrociclo:", error);
    return NextResponse.json(
      { error: "Error deleting macrociclo" },
      { status: 500 },
    );
  }
}
