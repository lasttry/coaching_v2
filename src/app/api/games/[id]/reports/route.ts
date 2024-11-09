import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();
type Params = Promise<{ id: number }>;

// GET: Retrieve all reports for a specific game
export async function GET(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = params.id;

  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    const reports = await prisma.athleteReport.findMany({
      where: {
        gameId: gameId,
      },
      include: {
        athlete: true, // Includes the athlete related to the athleteId
        reviewdAthlete: true, // Includes the athlete who submitted the report (submittedById)
      },
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}

// PUT: Update or create reports for a game
export async function PUT(req: NextRequest, segmentData: { params: Params }) {
  const params = await segmentData.params;
  const gameId = params.id;

  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    const reqBody = await req.json();
    const reports = reqBody as Array<{
      athleteId: number;
      reviewdAthleteId: number;
      gameId: number;
      teamObservation: string;
      individualObservation: string;
      timePlayedObservation: string;
    }>;

    const updatePromises = reports.map((report) =>
      prisma.athleteReport.upsert({
        where: {
          gameId_athleteId: {
            gameId: report.gameId,
            athleteId: report.athleteId,
          },
        },
        update: {
          teamObservation: report.teamObservation,
          individualObservation: report.individualObservation,
          timePlayedObservation: report.timePlayedObservation,
        },
        create: report,
      }),
    );

    await Promise.all(updatePromises);

    return NextResponse.json(
      { message: "Reports saved successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating or creating reports:", error);
    return NextResponse.json(
      { error: "Failed to save reports" },
      { status: 500 },
    );
  }
}
