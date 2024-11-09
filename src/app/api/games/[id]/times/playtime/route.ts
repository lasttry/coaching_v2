import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

type Params = Promise<{ id: number }>;
const prisma = new PrismaClient();

// GET: Retrieve all time entries for a specific game and calculate total time played
export async function GET(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = Number(params.id);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    // Fetch all time entries for this game
    const timeEntries = await prisma.timeEntry.findMany({
      where: { gameId },
      include: {
        athlete: true, // Include athlete details
      },
      orderBy: {
        period: "asc", // Order by period for consistent calculations
      },
    });

    // Determine the maximum number of periods in the game, ensuring a minimum of 4 periods
    const maxPeriod = Math.max(
      timeEntries.reduce((max, entry) => Math.max(max, entry.period), 0),
      4,
    );

    // Group time entries by athlete and calculate total playtime
    const playtimeResults = timeEntries.reduce((acc: any, entry) => {
      const athleteId = entry.athleteId;

      // Initialize athlete's data if not already present
      if (!acc[athleteId]) {
        acc[athleteId] = { totalTimePlayed: 0, periods: {} };

        // Initialize time for all periods to 0 for this athlete
        for (let i = 1; i <= maxPeriod; i++) {
          acc[athleteId].periods[i] = 0;
        }
      }

      // Calculate the entry time in seconds
      const entryTimeInSeconds = entry.entryMinute * 60 + entry.entrySecond;
      console.log(
        `EntryTimeInSeconds for period ${entry.period}: ${entryTimeInSeconds}`,
      );

      let exitTimeInSeconds;

      // If exit time is defined, calculate it
      if (entry.exitMinute !== null && entry.exitSecond !== null) {
        exitTimeInSeconds = entry.exitMinute * 60 + entry.exitSecond;
        console.log(
          `ExitTimeInSeconds for period ${entry.period}: ${exitTimeInSeconds}`,
        );
      } else {
        // If exit time is not defined, default to the start of the next period (minute = 0, second = 0)
        exitTimeInSeconds = 0; // Beginning of the next period (0 minutes and 0 seconds)
        console.log(
          `Default ExitTimeInSeconds for period ${entry.period}: ${exitTimeInSeconds}`,
        );
      }

      // Calculate the time played for this entry and add it to the correct period
      const timePlayed = entryTimeInSeconds - exitTimeInSeconds;
      acc[athleteId].periods[entry.period] += Math.max(0, timePlayed); // Ensure no negative time
      acc[athleteId].totalTimePlayed += Math.max(0, timePlayed); // Add to total time played

      return acc;
    }, {});

    // Convert results to an array format for easier JSON serialization
    const resultArray = Object.keys(playtimeResults).map((athleteId) => ({
      athleteId: Number(athleteId),
      totalTimePlayed: playtimeResults[athleteId].totalTimePlayed,
      periods: playtimeResults[athleteId].periods,
    }));

    console.log(resultArray);

    return NextResponse.json(resultArray, { status: 200 });
  } catch (error) {
    console.error(
      "Error fetching time entries or calculating playtime:",
      error,
    );
    return NextResponse.json(
      { error: "Failed to calculate time entries" },
      { status: 500 },
    );
  }
}
