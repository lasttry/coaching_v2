import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
type Params = Promise<{ id: number }>

// GET handler for fetching a team by ID
export async function GET(
  request: Request,
  segmentData: { params: Params }) {
    const params = await segmentData.params
    const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid Mesocycle ID" },
      { status: 400 },
    );
  }

  try {
    const mesocycle = await prisma.mesocycle.findUnique({
      where: { id },
    });

    if (!mesocycle) {
      return NextResponse.json(
        { error: "Mesocycle not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(mesocycle);
  } catch (error) {
    console.error("Error fetching Mesocycle:", error);
    return NextResponse.json(
      { error: "Error fetching Mesocycle" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  segmentData: { params: Params }) {
    const params = await segmentData.params
    const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid mesocyclo ID" },
      { status: 400 },
    );
  }

  try {
    const data = await request.json();

    const updateMesocycle = await prisma.mesocycle.update({
      where: { id },
      data: {
        number: Number(data.number),
        name: data.name,
        notes: data.notes,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        macrocycleId: data.macrocycleId
      },
    });

    return NextResponse.json(updateMesocycle, { status: 200 });
  } catch (error) {
    console.error("Error updating mesocycle:", error);
    return NextResponse.json(
      { error: "Error updating mesocycle" },
      { status: 500 },
    );
  }
}

// DELETE handler for deleting a team
export async function DELETE(
  request: Request,
  segmentData: { params: Params }) {
    const params = await segmentData.params
    const id = params.id;

  if (isNaN(id)) {
    return NextResponse.json(
      { error: "Invalid mesocycle ID" },
      { status: 400 },
    );
  }

  try {
    await prisma.mesocycle.delete({
      where: { id },
    });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error("Error deleting mesocycle:", error);
    return NextResponse.json(
      { error: "Error deleting mesocycle" },
      { status: 500 },
    );
  }
}
