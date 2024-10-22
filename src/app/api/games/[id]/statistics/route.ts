import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handle GET request
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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
    return NextResponse.json({ error: 'An error occurred while fetching statistics' }, { status: 500 });
  }
}

// POST: Create new time entries for a game
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const gameId = Number(params.id);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const reqBody = await req.text(); // Read the raw body text
    const timeEntries = JSON.parse(reqBody); // Parse the body to JSON

    const createPromises = timeEntries.map((entry: any) => {
      return prisma.timeEntry.create({
        data: {
          gameId,
          athleteId: entry.athleteId,
          period: entry.period,
          minute: entry.minute,
          second: entry.second,
          eventType: entry.eventType, // ENTRY or EXIT
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
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const gameId = Number(params.id);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const reqBody = await req.text(); // Read the raw body text
    const timeEntries = JSON.parse(reqBody); // Parse the body to JSON

    const updatePromises = timeEntries.map((entry: any) => {
      return prisma.timeEntry.upsert({
        where: {
          id: entry.id, // Ensure each entry has an ID for upsert to work
        },
        update: {
          period: entry.period,
          minute: entry.minute,
          second: entry.second,
          eventType: entry.eventType,
        },
        create: {
          gameId,
          athleteId: entry.athleteId,
          period: entry.period,
          minute: entry.minute,
          second: entry.second,
          eventType: entry.eventType,
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

