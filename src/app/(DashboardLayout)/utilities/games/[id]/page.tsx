'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Typography, Box, Stack, CircularProgress } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import dayjs from 'dayjs';
import { Game } from '@/types/games/types'
import { generatePDF, generateStatisticsPDF } from '@/app/utilities/pdf/pdfUtils'; // Import PDF utility
import { generateReportsPDF } from '@/app/utilities/pdf/reports'

import { Settings } from '@/types/settings/types'


const GameDetails = () => {

  const [game, setGame] = useState<Game | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playtime, setPlaytime] = useState<Record<number, number>>({});

  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id; // Get id unconditionally

  useEffect(() => {

    async function fetchPlaytimeData() {
      try {
        // Fetch total play time with period breakdown
        const playtimeResponse = await fetch(`/api/games/${id}/times/playtime`);
        if (playtimeResponse.ok) {
          const playtimeData = await playtimeResponse.json();
  
          // Create a map of playtime data by athleteId
          const playtimeMap = playtimeData.reduce((acc: Record<number, { totalTimePlayed: number, periods: Record<number, number> }>, entry: { athleteId: number, totalTimePlayed: number, periods: Record<number, number> }) => {
            acc[entry.athleteId] = {
              totalTimePlayed: entry.totalTimePlayed,
              periods: entry.periods
            };
            return acc;
          }, {});
          setPlaytime(playtimeMap);  // Set playtime data for athletes
        }
      } catch (error) {
        console.error('Failed to fetch playtime data:', error);
      }
    }
  
    fetchPlaytimeData();

    async function fetchGameDetails() {
      try {
        const response = await fetch(`/api/games/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }
  
        const gameData = await response.json();
        setGame({
          ...gameData.game,
          athletes: gameData.game.athletes || [], // Ensure athletes is always an array
          teams: gameData.game.teams || { name: 'Unknown Team' }, // Default team name
        });
        setSettings(gameData.settings);
  
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load game details.');
        setLoading(false);
      }
    }
  
    fetchGameDetails();
    
    async function fetchGame() {
      try {
        const response = await fetch(`/api/games/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }
        
        const gameData = await response.json();

        console.log('Fetched Game Data:', gameData); // Log to ensure correct data
        setGame({
          ...gameData.game,
          athletes: gameData.game.athletes || [],  // Ensure athletes is always an array
          teams: gameData.game.teams || { name: 'Unknown Team' }, // Default team name
        });
        setSettings(gameData.settings);
        setLoading(false);
      } catch (err) {
        console.error(err)
        setError('Failed to load game details.');
        setLoading(false);
      }
    }
  
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
        <Typography variant="body1"><strong>Number:</strong> {game?.number || 'N/A'}</Typography>
        <Typography variant="body1"><strong>Date:</strong> {dayjs(game?.date).format('YYYY-MM-DD HH:mm')}</Typography>
        <Typography variant="body1"><strong>Opponent:</strong> {game?.teams?.name || 'N/A'}</Typography>
        <Typography variant="body1"><strong>Competition:</strong> {game?.competition || 'N/A'}</Typography>
        <Typography variant="body1"><strong>Subcompetition:</strong> {game?.subcomp || 'N/A'}</Typography>
        <Typography variant="body1"><strong>Notes:</strong> {game?.notes || 'No notes'}</Typography>
        <Typography variant="body1"><strong>Away Game:</strong> {game?.away ? 'Yes' : 'No'}</Typography>
      </Box>

{/* Athletes Information */}
<Typography variant="h5" gutterBottom>
  Athletes
</Typography>
<Box marginY={2}>
  {game?.athletes?.length ? (
    game.athletes.map((athlete) => (
      <Box key={athlete.id} marginY={1}>
        {/* Display Athlete Info */}
        <Typography>
          {athlete.number} - {athlete.name} ({dayjs(athlete.birthdate).format('YYYY')}) - Total Time Played: {playtime[athlete.id] ? `${Math.floor(playtime[athlete.id].totalTimePlayed / 60)}m ${playtime[athlete.id].totalTimePlayed % 60}s` : '0m 0s'}
        </Typography>

        {/* Display Time Played Per Period */}
        <Typography variant="body2" color="textSecondary">
          {Object.keys(playtime[athlete.id]?.periods || {}).map((period) => (
            <span key={`${athlete.id}-period-${period}`}>
              Period {period}: {playtime[athlete.id].periods[period] ? `${Math.floor(playtime[athlete.id].periods[period] / 60)}m ${playtime[athlete.id].periods[period] % 60}s` : '0m 0s'}{' '}
            </span>
          ))}
        </Typography>
      </Box>
    ))
  ) : (
    <Typography>No athletes listed</Typography>
  )}
</Box>
      {/* Button to generate PDF */}
      <Stack direction="row" spacing={2} marginTop={4}>
        <Button variant="contained" color="primary" onClick={() => game && settings && generatePDF(game, settings)}>
          Folha de Jogo
        </Button>
        <Button variant="contained" color="primary" onClick={() => game && settings && generateStatisticsPDF(game, settings)}>
          Folha de Estatisticas
        </Button>
        {/* New button to add statistics */}
        <Button variant="contained" color="primary" onClick={() => router.push(`/utilities/games/${id}/statistics`)}>
          Add Statistics
        </Button>
        <Button variant="contained" color="primary" onClick={() => router.push(`/utilities/games/${id}/time`)}>
          Manage Play Times
        </Button>
          {/* New button to manage athlete reports */}
          <Button variant="contained" color="primary" onClick={() => router.push(`/utilities/games/${id}/reports`)}>
            Manage Reports
          </Button>
          <Button onClick={() => generateReportsPDF(game)}>Export Reports to PDF</Button>
          <Button variant="outlined" color="secondary" onClick={() => window.history.back()}>
          Back
        </Button>
      </Stack>
    </PageContainer>
  );
};

export default GameDetails;
