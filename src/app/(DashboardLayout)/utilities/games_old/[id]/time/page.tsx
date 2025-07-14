'use client';

import React, { useState, useEffect, ReactElement } from 'react';
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
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { log, logger } from '@/lib/logger';

// Define the types
interface Athlete {
  id: number;
  name: string;
  number: string;
}

interface TimeEntry {
  id?: number;
  gameId: number;
  athleteId: number;
  period: number;
  entryMinute: number;
  entrySecond: number;
  exitMinute?: number;
  exitSecond?: number;
}

const GameTimes = (): ReactElement => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [times, setTimes] = useState<Record<number, TimeEntry[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const gameId = params?.id;

  useEffect(() => {
    async function fetchAthletesAndTimes(): Promise<void> {
      try {
        // Fetch athletes
        const athleteRes = await fetch(`/api/games/${gameId}/athletes`);
        if (!athleteRes.ok) {
          console.error('Failed to fetch athletes');
          return;
        }
        const athleteData = await athleteRes.json();
        const athletes = athleteData.map(
          (entry: { athleteId: number; athletes: Athlete }) => entry.athletes
        );
        setAthletes(athletes || []);

        // Fetch existing times
        const timeRes = await fetch(`/api/games/${gameId}/times`);
        if (timeRes.ok) {
          const timeData: TimeEntry[] = await timeRes.json();
          const timeMap: Record<number, TimeEntry[]> = {};

          timeData.forEach((time: TimeEntry) => {
            if (!timeMap[time.athleteId]) timeMap[time.athleteId] = [];
            timeMap[time.athleteId].push(time);
          });

          setTimes(timeMap);
        } else {
          logger.debug('No times found');
        }
      } catch (err) {
        log.error(err);
        setError('Failed to load athletes or times');
      }
    }
    fetchAthletesAndTimes();
  }, [gameId]);

  // Check if data is still loading
  if (athletes.length === 0 && !error) {
    return <Typography>Loading...</Typography>;
  }

  const handleTimeChange = (
    athleteId: number,
    index: number,
    field: keyof TimeEntry,
    value: string | number
  ): void => {
    setTimes((prevTimes) => ({
      ...prevTimes,
      [athleteId]: prevTimes[athleteId].map((time, i) =>
        i === index ? { ...time, [field]: value } : time
      ),
    }));
  };

  const handleAddTime = (athleteId: number): void => {
    const newTime: TimeEntry = {
      gameId: Number(gameId),
      athleteId: athleteId,
      period: 1,
      entryMinute: 0,
      entrySecond: 0,
      exitMinute: undefined,
      exitSecond: undefined,
    };
    setTimes((prevTimes) => ({
      ...prevTimes,
      [athleteId]: [...(prevTimes[athleteId] || []), newTime],
    }));
  };

  const handleRemoveTime = async (athleteId: number, index: number): Promise<void> => {
    const entryId = times[athleteId][index].id; // Get the entry ID
    if (!entryId) return; // Make sure there is an ID to delete

    try {
      const response = await fetch(`/api/games/${entryId}/times`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete the time entry');
      }

      // Update local state after successful deletion
      setTimes((prevTimes) => ({
        ...prevTimes,
        [athleteId]: prevTimes[athleteId].filter((_, i) => i !== index),
      }));
    } catch (error) {
      console.error(error);
      setError('Failed to delete time entry.');
    }
  };

  const handleSaveTimes = async (): Promise<void> => {
    try {
      const response = await fetch(`/api/games/${gameId}/times`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.values(times).flat()), // Flatten the times array for submission
      });

      if (response.ok) {
        setSuccess('Times saved successfully');
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to save times');
      }
    } catch (err) {
      log.error(err);
      setError('Failed to save times');
    }
  };

  return (
    <Box>
      <Typography variant="h4">Game Times</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Athlete</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Entry Minute</TableCell>
              <TableCell>Entry Second</TableCell>
              <TableCell>Exit Minute</TableCell>
              <TableCell>Exit Second</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {athletes.map((athlete) => (
              <React.Fragment key={athlete.id}>
                {times[athlete.id]?.map((time, index) => (
                  <TableRow key={index}>
                    <TableCell>{`${athlete.number} - ${athlete.name}`}</TableCell>
                    <TableCell>
                      <TextField
                        value={time.period}
                        onChange={(e) =>
                          handleTimeChange(athlete.id, index, 'period', Number(e.target.value))
                        }
                        size="small"
                        type="number"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Entry Minute"
                        value={time.entryMinute}
                        onChange={(e) =>
                          handleTimeChange(athlete.id, index, 'entryMinute', Number(e.target.value))
                        }
                        size="small"
                        type="number"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Entry Second"
                        value={time.entrySecond}
                        onChange={(e) =>
                          handleTimeChange(athlete.id, index, 'entrySecond', Number(e.target.value))
                        }
                        size="small"
                        type="number"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Exit Minute"
                        value={time.exitMinute || ''}
                        onChange={(e) =>
                          handleTimeChange(athlete.id, index, 'exitMinute', Number(e.target.value))
                        }
                        size="small"
                        type="number"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        label="Exit Second"
                        value={time.exitSecond || ''}
                        onChange={(e) =>
                          handleTimeChange(athlete.id, index, 'exitSecond', Number(e.target.value))
                        }
                        size="small"
                        type="number"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleRemoveTime(athlete.id, index)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={7}>
                    <Button onClick={() => handleAddTime(athlete.id)} variant="outlined" fullWidth>
                      {`Add Time for ${athlete.name}`}
                    </Button>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSaveTimes}>
          Save Times
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

export default GameTimes;
