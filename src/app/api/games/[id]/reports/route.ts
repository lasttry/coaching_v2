import { NextRequest, NextResponse } from "next/server";
import { GameAthleteReport } from "@/types/games/types";
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: number }>;

// GET: Retrieve all reports for a specific game
export async function GET(req: NextRequest, segmentData: { params: Params }) {
  console.log("getting athleteReports - step1")
  const params = await segmentData.params;
  const gameId = params.id;

  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    console.log(`getting athleteReports ${gameId}`)
    const payload = {
      where: {
        gameId: Number(gameId),
      },
      include: {
        athlete: true, // Includes the athlete related to the athleteId
        reviewedAthlete: true, // Includes the athlete who submitted the report (submittedById)
      },
    }
    const reports = await prisma.athleteReport.findMany(payload);
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
    const reports = reqBody as Array<GameAthleteReport>;
    console.log("received reports")
    console.log(reports)

    const updatePromises = reports.map((report) => {
      const payload = {
        where: {
          gameId_athleteId: {
            gameId: Number(report.gameId),
            athleteId: Number(report.athleteId),
          },
        },
        update: {
          reviewedAthleteId: report.reviewedAthleteId,
          teamObservation: report.teamObservation,
          individualObservation: report.individualObservation,
          timePlayedObservation: report.timePlayedObservation,
        },
        create: {
          gameId: report.gameId,
          athleteId: report.athleteId,
          reviewedAthleteId: report.reviewedAthleteId,
          teamObservation: report.teamObservation,
          individualObservation: report.individualObservation,
          timePlayedObservation: report.timePlayedObservation,
        },
      };

      console.log("payload")
      console.log(payload);

      // Return each upsert promise to be collected in updatePromises
      return prisma.athleteReport.upsert(payload);
    });

    await Promise.all(updatePromises);

    return NextResponse.json(
      { message: "Reports saved successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to save reports" },
      { status: 500 },
    );
  }
}
