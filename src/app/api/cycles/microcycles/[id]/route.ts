import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

type Params = Promise<{ id: number }>;

// GET: Retrieve a specific microcycle
export async function GET(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid microcycle ID" }, { status: 400 });
  }

  try {
    const microcycle = await prisma.microcycle.findUnique({
      where: { id },
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
    console.error("Error fetching microcycle:", error);
    return NextResponse.json({ error: "Failed to fetch microcycle" }, { status: 500 });
  }
}

// PUT: Update a specific microcycle
export async function PUT(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid microcycle ID" }, { status: 400 });
  }

  const body = await req.json();

  try {
    const sessionGoals = body.sessionGoals.map((goal: { duration: string; note: string; coach: string }) => ({
      duration: Number(goal.duration),
      note: goal.note,
      coach: goal.coach,
    }));

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
          create: sessionGoals,
        },
      },
      include: {
        sessionGoals: true,
      },
    };

    const updatedMicrocycle = await prisma.microcycle.update(payload);

    return NextResponse.json(updatedMicrocycle);
  } catch (error) {
    console.error("Error updating microcycle:", error);
    return NextResponse.json({ error: "Failed to update microcycle" }, { status: 500 });
  }
}

// DELETE: Delete a specific microcycle
export async function DELETE(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid microcycle ID" }, { status: 400 });
  }

  try {
    await prisma.microcycle.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Microcycle deleted successfully" });
  } catch (error) {
    console.error("Error deleting microcycle:", error);
    return NextResponse.json({ error: "Failed to delete microcycle" }, { status: 500 });
  }
}
