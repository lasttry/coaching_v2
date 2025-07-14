'use client';
import React, { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { log } from '@/lib/logger';

// Define types
interface Athlete {
  id: number;
  name: string;
  number: string;
}

interface Statistic {
  id: number;
  gameId: number;
  athleteId: number;
  freeThrowScored: number;
  freeThrowMissed: number;
  fieldGoalScored: number;
  fieldGoalMissed: number;
  threePtsScored: number;
  threePtsMissed: number;
  assists: number;
  defensiveRebounds: number;
  offensiveRebounds: number;
  totalRebounds: number;
  blocks: number;
  steals: number;
  turnovers: number;
  fouls: number;
}
interface GameAthlete {
  gameId: number;
  athleteId: number;
  athletes: Athlete;
}

const GameStatistics = (): ReactElement => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [statistics, setStatistics] = useState<Record<number, Statistic>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const excludedFields: (keyof Statistic)[] = ['id', 'gameId', 'athleteId']; // Exclude id, gameId, and athleteId

  const gameId = params?.id;

  useEffect(() => {
    async function fetchAthletesAndStatistics(): Promise<void> {
      try {
        // Fetch the athletes in the game
        const athleteRes = await fetch(`/api/games/${gameId}/athletes`);
        if (!athleteRes.ok) {
          console.error('Failed to fetch athletes');
          return;
        }
        const athleteData = await athleteRes.json();
        const athletes = athleteData.map((entry: GameAthlete) => entry.athletes);
        setAthletes(athletes || []);

        // Initialize statistics with default values for each athlete
        const initialStats: Record<number, Statistic> = {};
        athletes.forEach((athlete: Athlete) => {
          initialStats[athlete.id] = {
            id: 0,
            gameId: Number(gameId) || 0,
            athleteId: athlete.id,
            freeThrowScored: 0,
            freeThrowMissed: 0,
            fieldGoalScored: 0,
            fieldGoalMissed: 0,
            threePtsScored: 0,
            threePtsMissed: 0,
            assists: 0,
            defensiveRebounds: 0,
            offensiveRebounds: 0,
            totalRebounds: 0,
            blocks: 0,
            steals: 0,
            turnovers: 0,
            fouls: 0,
          };
        });

        // Fetch existing statistics if available
        const statsRes = await fetch(`/api/games/${gameId}/statistics`);
        if (statsRes.ok) {
          const statsData: Statistic[] = await statsRes.json();

          // Overwrite initialStats with the fetched statistics
          statsData.forEach((stat: Statistic) => {
            initialStats[stat.athleteId] = stat;
          });
        } else {
        }

        setStatistics(initialStats); // Ensure statistics are properly set in state
      } catch (err) {
        log.error(err);
        setError('Failed to load athletes or statistics');
      }
    }

    fetchAthletesAndStatistics();
  }, [gameId]);

  const handleStatisticChange = (
    athleteId: number,
    field: keyof Statistic,
    value: string
  ): void => {
    setStatistics((prevStats) => ({
      ...prevStats,
      [athleteId]: {
        ...prevStats[athleteId],
        [field]: Number(value),
      },
    }));
  };

  const handleSaveStatistics = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/games/${gameId}/statistics`, {
        method: 'PUT', // Use PUT to update the existing statistics
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.values(statistics)),
      });

      if (response.ok) {
        setSuccess('Statistics updated successfully');
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update statistics');
      }
    } catch (err) {
      log.error(err);
      setError('Failed to update statistics');
    }
  };

  return (
    <Box>
      <Typography variant="h4">Game Statistics</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Athlete</TableCell>
              <TableCell>FT Scored</TableCell>
              <TableCell>FT Missed</TableCell>
              <TableCell>FG Scored</TableCell>
              <TableCell>FG Missed</TableCell>
              <TableCell>3PTS Scored</TableCell>
              <TableCell>3PTS Missed</TableCell>
              <TableCell>Assists</TableCell>
              <TableCell>Def. Reb.</TableCell>
              <TableCell>Off. Reb.</TableCell>
              <TableCell>Total Reb.</TableCell>
              <TableCell>Blocks</TableCell>
              <TableCell>Steals</TableCell>
              <TableCell>Turnovers</TableCell>
              <TableCell>Fouls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {athletes.map((athlete) => (
              <TableRow key={athlete.id}>
                <TableCell>{`${athlete.number} - ${athlete.name}`}</TableCell>
                {Object.keys(statistics[athlete.id] || {})
                  .filter((field) => !excludedFields.includes(field as keyof Statistic)) // Filter out excluded fields
                  .map((stat) => (
                    <TableCell key={stat}>
                      <TextField
                        value={statistics[athlete.id]?.[stat as keyof Statistic] || 0}
                        onChange={(e) =>
                          handleStatisticChange(athlete.id, stat as keyof Statistic, e.target.value)
                        }
                        size="small"
                        type="number"
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-input': {
                            padding: '0', // Remove padding inside the textbox
                          },
                        }}
                      />
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSaveStatistics}>
          Save Statistics
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => router.push(`/utilities/games/${gameId}`)}
        >
          Back to Game
        </Button>
      </Stack>
    </Box>
  );
};

export default GameStatistics;
