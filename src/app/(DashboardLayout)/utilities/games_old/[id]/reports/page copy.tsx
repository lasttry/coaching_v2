'use client';
import React, { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import { Box, Button, TextField, Stack, Typography, CircularProgress, Select, MenuItem } from '@mui/material';
import { useParams } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';

interface Athlete {
  id: number;
  name: string;
  number: string;
}

interface AthleteReport {
  id?: number;
  gameId: number;
  athleteId: number;
  reviewdAthleteId: number;
  teamObservation: string;
  individualObservation: string;
  timePlayedObservation: string;
}

const GameAthleteReportsPage = (): ReactElement => {
  const params = useParams<{ id: string }>();
  const gameId = Number(params?.id);

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [reports, setReports] = useState<Record<number, AthleteReport>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAthletesAndReports(): Promise<void> {
      try {
        const [athletesRes, reportsRes] = await Promise.all([fetch(`/api/athletes`), fetch(`/api/games/${gameId}/reports`)]);

        if (!athletesRes.ok || !reportsRes.ok) {
          throw new Error('Failed to fetch data.');
        }

        const athletesData: Athlete[] = await athletesRes.json();
        const reportsData: AthleteReport[] = await reportsRes.json();

        const reportsMap = reportsData.reduce(
          (acc, report) => {
            acc[report.athleteId] = report;
            return acc;
          },
          {} as Record<number, AthleteReport>
        );

        setAthletes(athletesData);
        setReports(reportsMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAthletesAndReports();
  }, [gameId]);

  const handleInputChange = (athleteId: number, field: keyof AthleteReport, value: string | number): void => {
    setReports((prevReports) => ({
      ...prevReports,
      [athleteId]: {
        ...prevReports[athleteId],
        [field]: value,
        athleteId,
        gameId,
      },
    }));
  };

  const handleSaveReports = async (): Promise<void> => {
    setError(null);
    setSuccess(null);

    const reportsArray = Object.values(reports);
    try {
      const response = await fetch(`/api/games/${gameId}/reports`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportsArray),
      });

      if (response.ok) {
        setSuccess('Reports saved successfully.');
      } else {
        const errorData = await response.json();
        setError(`Failed to save reports: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to save reports:', error);
      setError('Failed to save reports. Please try again.');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <PageContainer title="Athlete Reports" description="Manage reports for each athlete">
      <Stack spacing={3}>
        <Typography variant="h4" gutterBottom>
          Athlete Reports
        </Typography>

        {success && <Typography color="success">{success}</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {athletes.map((athlete) => (
          <Box key={athlete.id} padding={2} border="1px solid gray" marginY={2}>
            <Typography variant="h5">
              {athlete.number} - {athlete.name}
            </Typography>

            {/* Reviewd Athlete Dropdown */}
            <Select
              value={reports[athlete.id]?.reviewdAthleteId || athlete.id}
              onChange={(e) => handleInputChange(athlete.id, 'reviewdAthleteId', Number(e.target.value))}
              fullWidth
            >
              {athletes.map((otherAthlete) => (
                <MenuItem key={otherAthlete.id} value={otherAthlete.id}>
                  {otherAthlete.name}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Team Observation"
              name="teamObservation"
              multiline
              minRows={3}
              fullWidth
              value={reports[athlete.id]?.teamObservation || ''}
              onChange={(e) => handleInputChange(athlete.id, 'teamObservation', e.target.value)}
              margin="normal"
            />
            <TextField
              label="Individual Observation"
              name="individualObservation"
              multiline
              minRows={3}
              fullWidth
              value={reports[athlete.id]?.individualObservation || ''}
              onChange={(e) => handleInputChange(athlete.id, 'individualObservation', e.target.value)}
              margin="normal"
            />
            <TextField
              label="Time Played Observation"
              name="timePlayedObservation"
              multiline
              minRows={3}
              fullWidth
              value={reports[athlete.id]?.timePlayedObservation || ''}
              onChange={(e) => handleInputChange(athlete.id, 'timePlayedObservation', e.target.value)}
              margin="normal"
            />
          </Box>
        ))}

        <Box display="flex" justifyContent="space-between" marginTop={4}>
          <Button variant="contained" color="primary" onClick={handleSaveReports}>
            Save Reports
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </Box>
      </Stack>
    </PageContainer>
  );
};

export default GameAthleteReportsPage;
