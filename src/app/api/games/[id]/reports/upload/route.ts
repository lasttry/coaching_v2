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
      include: { teams: true }
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
      console.log(`competition: ${game.competition}/campeonato: ${row['Campeonato']}`)
      console.log(`game.teams.name: ${game.teams.name}/adversario: ${row['Adversário']}`)
      if (game.competition?.trim().toLowerCase() !== row['Campeonato'].trim().toLowerCase() 
        || (game.teams.name.trim().toLowerCase() !== row['Adversário'].trim().toLowerCase())) {
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
      console.log(`${athleteSubmitted.id} - ${athleteSubmitted.name}`)

      // Find the athlete being reviewed (self or another athlete)
      const reviewedAthlete = isSelf ? athleteSubmitted : await prisma.athletes.findFirst({
        where: {
          name: {
            contains: athleteNameReview,
            mode: 'insensitive',
          },
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
          reviewdAthleteId: reviewedAthlete.id,
        },
        create: {
          gameId: gameId,
          athleteId: athleteSubmitted.id,
          reviewdAthleteId: reviewedAthlete.id,
          teamObservation: teamObservation || null,
          individualObservation: individualObservation || null,
          timePlayedObservation: timePlayedObservation || null,
        },
      });

      reportPromises.push(reportPromise);
    }

    // Execute all the upsert operations and capture the results
    const results = await Promise.all(reportPromises);

    // Log the results to see the outcome of each upsert operation
    console.log('Upsert Results:', results);

    return NextResponse.json({ message: 'Reports processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing reports:', error);
    return NextResponse.json({ error: `Failed to process reports: ${error}` }, { status: 500 });
  }
}