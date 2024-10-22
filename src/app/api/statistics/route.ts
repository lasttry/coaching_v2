// /src/app/api/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { gameId, athleteId, statistics } = await req.json();

    // Add statistics entry linked to the game and athlete
    const newStatistics = await prisma.statistic.create({
      data: {
        gameId,
        athleteId,
        freeThrowScored: statistics.freeThrowScored,
        freeThrowMissed: statistics.freeThrowMissed,
        fieldGoalScored: statistics.fieldGoalScored,
        fieldGoalMissed: statistics.fieldGoalMissed,
        threePtsScored: statistics.threePtsScored,
        threePtsMissed: statistics.threePtsMissed,
        assists: statistics.assists,
        defensiveRebounds: statistics.defensiveRebounds,
        offensiveRebounds: statistics.offensiveRebounds,
        totalRebounds: statistics.defensiveRebounds + statistics.offensiveRebounds,
        blocks: statistics.blocks,
        steals: statistics.steals,
        turnovers: statistics.turnovers,
        fouls: statistics.fouls,
      },
    });

    return NextResponse.json(newStatistics);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add statistics' }, { status: 500 });
  }
}
