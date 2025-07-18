import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ id: number }>;

export async function POST(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse> {
  const params = await segmentData.params;
  const gameId = params.id;

  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const data = await req.json(); // Parse the JSON body (from the CSV rows)

    // Fetch the game from the database
    const game = await prisma.games.findUnique({
      where: { id: gameId },
      include: { opponent: true },
    });

    // Check if the game exists
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Delete all athlete reports related to this game
    await prisma.athleteReport.deleteMany({
      where: {
        gameId: gameId,
      },
    });

    const reportPromises = [];

    // Process each row of the data
    for (const row of data) {
      // Ignore rows where the competition does not match
      if (
        game.competition?.trim().toLowerCase() !== row['Campeonato'].trim().toLowerCase() ||
        game.opponent.name.trim().toLowerCase() !== row['Adversário'].trim().toLowerCase()
      ) {
        continue;
      }
      const athleteName = row['Atleta'].trim();
      const athleteNameReview = row['Atleta a analizar'].trim();
      const isSelf = athleteNameReview.toLowerCase().includes('eu'); // If "Eu", it's self
      // Find the athlete who submitted the report
      const athleteSubmitted = await prisma.athletes.findFirst({
        where: {
          name: athleteName,
        },
      });

      if (!athleteSubmitted) {
        throw new Error(`Athlete not found for name: ${athleteName}`);
      }

      // Find the athlete being reviewed (self or another athlete)
      const reviewedAthlete = isSelf
        ? athleteSubmitted
        : await prisma.athletes.findFirst({
            where: {
              name: athleteNameReview,
            },
          });

      if (!reviewedAthlete) {
        throw new Error(`Athlete to review not found for name: ${athleteNameReview}`);
      }
      // Extract the observations from the row
      const teamObservation = row['Relatório de jogo - Equipa'];
      const individualObservation = row['Relatório de jogo - Individual'];
      const timePlayedObservation = row['Opinião'];

      // Prepare the upsert promise for each row
      const reportPromise = prisma.athleteReport.upsert({
        where: {
          gameId_athleteId: {
            gameId: gameId,
            athleteId: athleteSubmitted.id,
          },
        },
        update: {
          teamObservation: teamObservation || null,
          individualObservation: individualObservation || null,
          timePlayedObservation: timePlayedObservation || null,
          athleteId: athleteSubmitted.id,
          reviewedAthleteId: reviewedAthlete.id,
        },
        create: {
          gameId: gameId,
          athleteId: athleteSubmitted.id,
          reviewedAthleteId: reviewedAthlete.id,
          teamObservation: teamObservation || null,
          individualObservation: individualObservation || null,
          timePlayedObservation: timePlayedObservation || null,
        },
      });

      reportPromises.push(reportPromise);
    }

    // Execute all the upsert operations and capture the results
    await Promise.all(reportPromises);

    // Log the results to see the outcome of each upsert operation

    return NextResponse.json({ message: 'Reports processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing reports:', error);
    return NextResponse.json({ error: `Failed to process reports: ${error}` }, { status: 500 });
  }
}
