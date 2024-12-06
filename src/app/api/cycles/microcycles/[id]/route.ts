import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Params = Promise<{ id: number }>;

// GET: Retrieve a specific microcycle
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid microcycle ID" }, { status: 400 });
  }

  try {
    const microcycle = await prisma.microcycle.findUnique({
      where: { id: Number(id) },
      include: {
        mesocycle: {
          include: {
            macrocycle: true, // Include the related macrocycle
          },
        },
        sessionGoals: true,
      },
    });

    if (!microcycle) {
      return NextResponse.json(
        { error: "Microcycle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(microcycle);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch microcycle" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid microcycle ID" }, { status: 400 });
  }

  const body = await request.json();

  try {
    const sessionGoals = body.sessionGoals.map((goal: { duration: string; note: string; coach: string }) => ({
      duration: Number(goal.duration),
      note: goal.note,
      coach: goal.coach,
    }));
    console.log(sessionGoals)
    const payload = {
      where: { id },
      data: {
        number: body.number,
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        notes: body.notes,
        mesocycleId: body.mesocycleId,
        sessionGoals: {
          deleteMany: {}, // Remove all existing session goals
          create: sessionGoals
        },
      },
      include: {
        sessionGoals: true,
      },
    }
    console.log(payload)
    const updatedMicrocycle = await prisma.microcycle.update(payload);

    return NextResponse.json(updatedMicrocycle);
  } catch (error) {
    console.error("Error updating microcycle:", error);
    return NextResponse.json({ error: "Failed to update microcycle" }, { status: 500 });
  }
}

// DELETE: Delete a specific microcycle
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid microcycle ID" }, { status: 400 });
  }

  try {
    await prisma.microcycle.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Microcycle deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete microcycle" }, { status: 500 });
  }
}
