import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: number }>;

// GET: Retrieve all time entries for a specific game
export async function GET(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = Number(params.id);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    const timeEntries = await prisma.timeEntry.findMany({
      where: { gameId },
      include: {
        athlete: true, // Include athlete details
      },
    });

    return NextResponse.json(timeEntries, { status: 200 });
  } catch (error) {
    console.error("Error fetching time entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch time entries" },
      { status: 500 },
    );
  }
}

// POST: Create new time entries for a game
export async function POST(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = params.id;

  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    const reqBody = await req.text();
    const timeEntries = JSON.parse(reqBody); // Parse the body to JSON

    const createPromises = timeEntries.map((entry: any) => {
      return prisma.timeEntry.create({
        data: {
          gameId,
          athleteId: entry.athleteId,
          period: entry.period,
          entryMinute: entry.entryMinute,
          entrySecond: entry.entrySecond,
          exitMinute: entry.exitMinute,
          exitSecond: entry.exitSecond,
        },
      });
    });

    await Promise.all(createPromises);

    return NextResponse.json(
      { message: "Time entries added successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error adding time entries:", error);
    return NextResponse.json(
      { error: "Failed to add time entries" },
      { status: 500 },
    );
  }
}

// PUT: Create or update time entries for a game
export async function PUT(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = params.id;

  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    const reqBody = await req.text();
    const timeEntries = JSON.parse(reqBody);

    // Filter out invalid entries (those that don't have 'athleteId' or other required fields)
    const validEntries = timeEntries.filter(
      (entry: any) =>
        entry.athleteId && entry.period && entry.entryMinute !== undefined,
    );

    const promises = validEntries.map((entry: any) => {
      return prisma.timeEntry.upsert({
        where: {
          id: entry.id || 0, // If id is undefined, use 0 (which won't match anything, so it will create a new record)
        },
        update: {
          period: entry.period,
          entryMinute: entry.entryMinute,
          entrySecond: entry.entrySecond,
          exitMinute: entry.exitMinute,
          exitSecond: entry.exitSecond,
        },
        create: {
          gameId,
          athleteId: entry.athleteId,
          period: entry.period,
          entryMinute: entry.entryMinute,
          entrySecond: entry.entrySecond,
          exitMinute: entry.exitMinute,
          exitSecond: entry.exitSecond,
        },
      });
    });

    await Promise.all(promises);

    return NextResponse.json(
      { message: "Time entries processed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error processing time entries:", error);
    return NextResponse.json(
      { error: "Failed to process time entries" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a specific time entry by ID
export async function DELETE(
  req: NextRequest,
  segmentData: { params: Params },
) {
  const params = await segmentData.params;
  const entryId = params.id;

  if (isNaN(entryId)) {
    return NextResponse.json({ error: "Invalid entry ID" }, { status: 400 });
  }

  try {
    await prisma.timeEntry.delete({
      where: {
        id: entryId,
      },
    });

    return NextResponse.json(
      { message: "Time entry deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting time entry:", error);
    return NextResponse.json(
      { error: "Failed to delete time entry" },
      { status: 500 },
    );
  }
}
