import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TimeEntryInput {
  id?: number;
  athleteId: number;
  period: number;
  entryMinute: number;
  entrySecond: number;
  exitMinute: number;
  exitSecond: number;
}

type Params = Promise<{ id: number }>;

// Handle GET request
export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const gameId = Number(params.id);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const statistics = await prisma.statistic.findMany({
      where: { gameId },
    });

    if (!statistics || statistics.length === 0) {
      return NextResponse.json({ error: 'Statistics not found' }, { status: 404 });
    }

    return NextResponse.json(statistics, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching statistics' },
      { status: 500 }
    );
  }
}

// POST: Create new time entries for a game
export async function POST(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const gameId = Number(params.id);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const reqBody = await req.text(); // Read the raw body text
    const timeEntries = JSON.parse(reqBody) as TimeEntryInput[]; // Parse the body to JSON

    const createPromises = timeEntries.map((entry: TimeEntryInput) => {
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

    return NextResponse.json({ message: 'Time entries added successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error adding time entries:', error);
    return NextResponse.json({ error: 'Failed to add time entries' }, { status: 500 });
  }
}

// PUT: Update existing time entries for a game
export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const gameId = params.id;

  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const reqBody = await req.text(); // Read the raw body text
    const timeEntries = JSON.parse(reqBody) as TimeEntryInput[];

    const updatePromises = timeEntries.map((entry: TimeEntryInput) => {
      return prisma.timeEntry.upsert({
        where: {
          id: entry.id, // Ensure each entry has an ID for upsert to work
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

    await Promise.all(updatePromises);

    return NextResponse.json({ message: 'Time entries updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating time entries:', error);
    return NextResponse.json({ error: 'Failed to update time entries' }, { status: 500 });
  }
}
