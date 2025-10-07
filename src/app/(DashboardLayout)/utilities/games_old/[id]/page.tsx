'use client';
import React, { ReactElement } from 'react';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography, Box, Stack, CircularProgress } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import dayjs from 'dayjs';
import { GameInterface } from '@/types/games/types';
import { generatePDF, generateStatisticsPDF } from '@/app/utilities/pdf/pdfUtils'; // Import PDF utility
import { generateReportsPDF } from '@/app/utilities/pdf/reports';

type Params = Promise<{ id: string }>;

const GameDetails = (props: { params: Params }): ReactElement => {
  const params = use(props.params);
  const id = params?.id; // Get id unconditionally

  const [game, setGame] = useState<GameInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playtime, setPlaytime] = useState<
    Record<number, { totalTimePlayed: number; periods: Record<number, number> }>
  >({});

  const router = useRouter();

  useEffect(() => {
    async function fetchPlaytimeData(): Promise<void> {
      try {
        const playtimeResponse = await fetch(`/api/games/${id}/times/playtime`);
        if (playtimeResponse.ok) {
          const playtimeData = await playtimeResponse.json();
          const playtimeMap = playtimeData.reduce(
            (
              acc: Record<number, { totalTimePlayed: number; periods: Record<number, number> }>,
              entry: {
                athleteId: number;
                totalTimePlayed: number;
                periods: Record<number, number>;
              }
            ) => {
              acc[entry.athleteId] = {
                totalTimePlayed: entry.totalTimePlayed,
                periods: entry.periods,
              };
              return acc;
            },
            {}
          );
          setPlaytime(playtimeMap);
        }
      } catch (error) {
        console.error('Failed to fetch playtime data:', error);
      }
    }

    async function fetchGame(): Promise<void> {
      try {
        const response = await fetch(`/api/games/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }

        const gameData = await response.json();
        setGame({
          ...gameData.game,
          teams: gameData.game.teams || { name: 'Unknown Team' },
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load game details.');
        setLoading(false);
      }
    }

    fetchPlaytimeData();
    fetchGame();
  }, [id]);

  if (loading) {
    return (
      <PageContainer title="Game Details">
        <CircularProgress />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Game Details">
        <Typography color="error">{error}</Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Game Details" description="Details of the game">
      <Typography variant="h4" gutterBottom>
        Game Details
      </Typography>

      {/* Game Information */}
      <Box marginY={2}>
        <Typography variant="body1">
          <strong>Number:</strong> {game?.number || 'N/A'}
        </Typography>
        <Typography variant="body1">
          <strong>Date:</strong> {dayjs(game?.date).format('YYYY-MM-DD HH:mm')}
        </Typography>
        <Typography variant="body1">
          <strong>Opponent:</strong> {game?.opponent?.name || 'N/A'}
        </Typography>
        <Typography variant="body1">
          <strong>Competition:</strong> {game?.competition || 'N/A'}
        </Typography>
        <Typography variant="body1">
          <strong>Subcompetition:</strong> {game?.subcomp || 'N/A'}
        </Typography>
        <Typography variant="body1">
          <strong>Notes:</strong> {game?.notes || 'No notes'}
        </Typography>
        <Typography variant="body1">
          <strong>Away Game:</strong> {game?.away ? 'Yes' : 'No'}
        </Typography>
      </Box>

      {/* Athletes Information */}
      <Typography variant="h5" gutterBottom>
        Athletes
      </Typography>
      <Box marginY={2}>
        {game?.gameAthletes?.length ? (
          game.gameAthletes.map((athletes) => (
            <Box key={athletes.athlete.id} marginY={1}>
              {/* Display Athlete Info */}
              <Typography>
                {athletes.number} - {athletes.athlete.name} (
                {dayjs(athletes.athlete.birthdate).format('YYYY')})
              </Typography>

              {/* Display Time Played Per Period */}
              <Typography variant="body2" color="textSecondary">
                {Object.keys(playtime[athletes.athlete.id]?.periods || {}).map((period) => {
                  const periodIndex = Number(period); // Convert period to a number
                  return (
                    <span key={`${athletes.athlete.id}-period-${period}`}>
                      Period {periodIndex}:{' '}
                      {playtime[athletes.athlete.id].periods[periodIndex]
                        ? `${Math.floor(playtime[athletes.athlete.id].periods[periodIndex] / 60)}m ${playtime[athletes.athlete.id].periods[periodIndex] % 60}s`
                        : '0m 0s'}{' '}
                    </span>
                  );
                })}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography>No athletes listed</Typography>
        )}
      </Box>
      {/* Button to generate PDF */}
      <Stack direction="row" spacing={2} marginTop={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => game && settings && generatePDF(game, settings)}
        >
          Folha de Jogo
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => game && settings && generateStatisticsPDF(game, settings)}
        >
          Folha de Estatisticas
        </Button>
        {/* New button to add statistics */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push(`/utilities/games/${id}/statistics`)}
        >
          Add Statistics
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push(`/utilities/games/${id}/time`)}
        >
          Manage Play Times
        </Button>
        {/* New button to manage athlete reports */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push(`/utilities/games/${id}/reports`)}
        >
          Manage Reports
        </Button>
        <Button onClick={() => game && generateReportsPDF(game, )}>Export Reports to PDF</Button>

        <Button variant="outlined" color="secondary" onClick={() => window.history.back()}>
          Back
        </Button>
      </Stack>
    </PageContainer>
  );
};

export default GameDetails;
