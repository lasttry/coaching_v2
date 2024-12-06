import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Params = Promise<{ id: number }>;

// GET: Retrieve a specific session goal
export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid session goal ID" }, { status: 400 });
  }

  try {
    const sessionGoal = await prisma.sessionGoal.findUnique({
      where: { id: Number(id) },
      include: { microcycle: true },
    });

    if (!sessionGoal) {
      return NextResponse.json(
        { error: "Session goal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(sessionGoal);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch session goal" }, { status: 500 });
  }
}

// PUT: Update a specific session goal
export async function PUT(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid session goal ID" }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { duration, note, coach, microcycleId } = data;

    const updatedSessionGoal = await prisma.sessionGoal.update({
      where: { id: Number(id) },
      data: {
        duration,
        note,
        coach,
        microcycleId,
      },
    });

    return NextResponse.json(updatedSessionGoal);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update session goal" }, { status: 500 });
  }
}

// DELETE: Delete a specific session goal
export async function DELETE(
  request: Request,
  { params }: { params: Params }
) {
  const { id } = await params;

  if (isNaN(Number(id))) {
    return NextResponse.json({ error: "Invalid session goal ID" }, { status: 400 });
  }

  try {
    await prisma.sessionGoal.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Session goal deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete session goal" }, { status: 500 });
  }
}
