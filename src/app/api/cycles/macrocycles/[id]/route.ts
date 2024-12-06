import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Params = Promise<{ id: number }>;

// GET: Retrieve a specific macrocycle
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid macrocycle ID" }, { status: 400 });
  }

  try {
    const macrocycle = await prisma.macrocycle.findUnique({
      where: { id: Number(id) },
      include: { mesocycles: true },
    });

    if (!macrocycle) {
      return NextResponse.json(
        { error: "Macrocycle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(macrocycle);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch macrocycle" }, { status: 500 });
  }
}

// PUT: Update a specific macrocycle
export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid macrocycle ID" }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { name, number, startDate, endDate, notes } = data;

    const updatedMacrocycle = await prisma.macrocycle.update({
      where: { id: Number(id) },
      data: {
        name,
        number,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        notes,
      },
    });

    return NextResponse.json(updatedMacrocycle);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update macrocycle" }, { status: 500 });
  }
}

// DELETE: Delete a specific macrocycle
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid macrocycle ID" }, { status: 400 });
  }

  try {
    await prisma.macrocycle.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Macrocycle deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete macrocycle" }, { status: 500 });
  }
}
