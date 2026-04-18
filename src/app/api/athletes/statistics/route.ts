import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clubId = session.user.selectedClubId;
    if (!clubId) {
      return NextResponse.json({ error: 'No club selected' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('fpb.competitionId');
    const competitionSerieId = searchParams.get('fpb.serieId');
    const startDate = searchParams.get('filters.startDate');
    const endDate = searchParams.get('filters.endDate');
    const teamId = searchParams.get('fpb.teamId');

    // Build game filter
    const gameFilter: {
      clubId: number;
      competitionId?: number;
      competitionSerieId?: number;
      teamId?: number;
      date?: { gte?: Date; lte?: Date };
    } = {
      clubId,
    };

    if (competitionId) {
      gameFilter.competitionId = parseInt(competitionId);
    }
    if (competitionSerieId) {
      gameFilter.competitionSerieId = parseInt(competitionSerieId);
    }
    if (teamId) {
      gameFilter.teamId = parseInt(teamId);
    }
    if (startDate || endDate) {
      gameFilter.date = {};
      if (startDate) {
        gameFilter.date.gte = new Date(startDate);
      }
      if (endDate) {
        gameFilter.date.lte = new Date(endDate);
      }
    }

    // Get all games with their athletes
    const games = await prisma.game.findMany({
      where: gameFilter,
      include: {
        gameAthletes: {
          include: {
            athlete: true,
          },
        },
        competition: true,
        competitionSerie: true,
        team: true,
        opponent: true,
      },
      orderBy: { date: 'asc' },
    });

    // Get all athletes from the club
    const athletes = await prisma.athlete.findMany({
      where: { clubId, active: true },
      orderBy: { name: 'asc' },
    });

    // Calculate statistics per athlete
    const athleteStats = athletes.map((athlete) => {
      const athleteGames = games.filter((game) =>
        game.gameAthletes.some((ga) => ga.athleteId === athlete.id)
      );

      // Group by competition
      const byCompetition: Record<
        string,
        {
          competitionId: number;
          competitionName: string;
          serieId?: number;
          serieName?: string;
          gameCount: number;
          games: {
            id: number;
            date: Date;
            opponent: string;
            away: boolean;
          }[];
        }
      > = {};

      athleteGames.forEach((game) => {
        const key = `${game.competitionId || 0}-${game.competitionSerieId || 0}`;
        if (!byCompetition[key]) {
          byCompetition[key] = {
            competitionId: game.competitionId || 0,
            competitionName: game.competition?.name || 'Sem Competição',
            serieId: game.competitionSerieId || undefined,
            serieName: game.competitionSerie?.name || undefined,
            gameCount: 0,
            games: [],
          };
        }
        byCompetition[key].gameCount++;
        byCompetition[key].games.push({
          id: game.id,
          date: game.date,
          opponent: game.opponent?.name || 'Desconhecido',
          away: game.away,
        });
      });

      return {
        id: athlete.id,
        name: athlete.name,
        number: athlete.number,
        birthdate: athlete.birthdate,
        photo: athlete.photo,
        totalGames: athleteGames.length,
        byCompetition: Object.values(byCompetition),
      };
    });

    // Sort by total games (descending)
    athleteStats.sort((a, b) => b.totalGames - a.totalGames);

    // Get summary totals
    const totalGames = games.length;

    // Get competitions that have games for this club
    const competitionIds = [...new Set(games.map((g) => g.competitionId).filter(Boolean))];
    const competitions = await prisma.competition.findMany({
      where: { id: { in: competitionIds as number[] } },
      include: { competitionSeries: true },
    });

    const teams = await prisma.team.findMany({
      where: { clubId },
      orderBy: { name: 'asc' },
    });

    // Map competitions to include series in expected format
    const competitionsWithSeries = competitions.map((comp) => ({
      id: comp.id,
      name: comp.name,
      series: comp.competitionSeries.map((s) => ({ id: s.id, name: s.name })),
    }));

    return NextResponse.json({
      athletes: athleteStats,
      totalGames,
      competitions: competitionsWithSeries,
      teams,
      filters: {
        competitionId: competitionId ? parseInt(competitionId) : null,
        competitionSerieId: competitionSerieId ? parseInt(competitionSerieId) : null,
        startDate,
        endDate,
        teamId: teamId ? parseInt(teamId) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching athlete statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
