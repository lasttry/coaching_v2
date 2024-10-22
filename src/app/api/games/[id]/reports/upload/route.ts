import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const gameId = Number(params.id);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 });
  }

  try {
    const data = await req.json(); // Parse the JSON body (from the CSV rows)

    // Fetch the game from the database
    const game = await prisma.games.findUnique({
      where: { id: gameId },
    });

    // Check if the game exists
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const reportPromises = [];

    // Process each row of the data
    for (const row of data) {
      // Ignore rows where the competition does not match
      console.log(`competition: ${game.competition}/campeonato: ${row['Campeonato']}`)
      if (game.competition?.trim().toLowerCase() !== row['Campeonato'].trim().toLowerCase()) {
        continue;
      }

      console.log(row);
      const athleteName = row['Atleta'].trim();
      const athleteNameReview = row['Atleta a analizar'].trim();
      const isSelf = athleteNameReview.toLowerCase().includes('eu'); // If "Eu", it's self
      console.log(`isSelf: ${isSelf}/athleteName: ${athleteNameReview}`);

      // Find the athlete who submitted the report
      const athleteSubmitted = await prisma.athletes.findFirst({
        where: {
          name: {
            contains: athleteName,
            mode: 'insensitive', // Case-insensitive search
          },
        },
      });

      if (!athleteSubmitted) {
        throw new Error(`Athlete not found for name: ${athleteName}`);
      }

      // Find the athlete being reviewed (self or another athlete)
      const reviewAthlete = isSelf ? athleteSubmitted : await prisma.athletes.findFirst({
        where: {
          name: {
            contains: athleteNameReview,
            mode: 'insensitive',
          },
        },
      });

      if (!reviewAthlete) {
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
            athleteId: reviewAthlete.id,
          },
        },
        update: {
          teamObservation: teamObservation || null,
          individualObservation: individualObservation || null,
          timePlayedObservation: timePlayedObservation || null,
          submittedById: athleteSubmitted.id,
        },
        create: {
          gameId: gameId,
          athleteId: reviewAthlete.id,
          submittedById: athleteSubmitted.id,
          teamObservation: teamObservation || null,
          individualObservation: individualObservation || null,
          timePlayedObservation: timePlayedObservation || null,
        },
      });

      reportPromises.push(reportPromise);
    }

    // Execute all the upsert operations
    await Promise.all(reportPromises);

    return NextResponse.json({ message: 'Reports processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing reports:', error);
    return NextResponse.json({ error: 'Failed to process reports' }, { status: 500 });
  }
}
