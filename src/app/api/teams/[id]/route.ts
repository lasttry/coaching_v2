import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

type Params = Promise<{ id: number }>;
const prisma = new PrismaClient();

// GET handler for fetching a team by ID
export async function GET(request: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const id = params.id;

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
  }

  try {
    const team = await prisma.teams.findUnique({
      where: { id },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Error fetching team" }, { status: 500 });
  }
}

export async function PUT(request: Request, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const id = params.id;

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
  }

  try {
    const data = await request.json();

    const updatedTeam = await prisma.teams.update({
      where: { id },
      data: {
        name: data.name,
        shortName: data.shortName,
        location: data.location,
        image: data.image || null, // Save the base64 image to the database, or null if removed
      },
    });

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ error: "Error updating team" }, { status: 500 });
  }
}

// DELETE handler for deleting a team
export async function DELETE(
  request: Request,
  segmentData: { params: Params },
) {
  const params = await segmentData.params;
  const id = params.id;

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
  }

  try {
    await prisma.teams.delete({
      where: { id },
    });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json({ error: "Error deleting team" }, { status: 500 });
  }
}
