'use client';

import React, { useState, useEffect, use } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Container, Stack, Select, MenuItem, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Athlete, GameAthleteReport } from '@/types/games/types';

const StyledTabs = styled(Tabs)({
  borderBottom: '2px solid #e0e0e0',
  '& .MuiTab-root': {
    textTransform: 'none',
    fontSize: '1.1rem',
    fontWeight: 600,
    padding: '12px 16px',
  },
  '& .Mui-selected': {
    color: '#3f51b5',
    fontWeight: 'bold',
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#3f51b5',
  },
});

const StyledTabPanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
}));

type Params = Promise<{ id: string }>;

const AthletesReportPage = (props: { params: Params }) => {
  const params = use(props.params);
  const gameId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [reports, setReports] = useState<GameAthleteReport[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    async function fetchAthletesAndReports() {
      try {
        const [athletesRes, reportsRes] = await Promise.all([
          fetch(`/api/athletes`),
          fetch(`/api/games/${gameId}/reports`),
        ]);

        if (!athletesRes.ok || !reportsRes.ok) throw new Error('Failed to fetch data.');

        const athletesData: Athlete[] = await athletesRes.json();
        const reportsData: GameAthleteReport[] = await reportsRes.json();

        setAthletes(athletesData);
        setReports(reportsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAthletesAndReports();
  }, [gameId]);

  const handleInputChange = (athleteId: number, field: keyof GameAthleteReport, value: string | number) => {
    setReports((prevReports) => {
      const reportIndex = prevReports.findIndex((report) => report.athleteId === athleteId);

      if (reportIndex >= 0) {
        return prevReports.map((report, index) =>
          index === reportIndex ? { ...report, [field]: value } : report
        );
      } else {
        return [
          ...prevReports,
          {
            id: Date.now(),
            gameId: Number(gameId),
            athleteId,
            reviewedAthleteId: athleteId,
            teamObservation: '',
            individualObservation: '',
            timePlayedObservation: '',
            [field]: value,
          } as GameAthleteReport,
        ];
      }
    });
    console.log(reports)
  };

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSaveReports = async () => {
    setError(null);
    setSuccess(null);

    const reportsArray = Object.values(reports);
    console.log(JSON.stringify(reportsArray));
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
    } catch (error: any) {
      console.error('Failed to save reports:', error);
      setError('Failed to save reports. Please try again.');
    }
  };


  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
          Athlete Reports
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center">
          Easily navigate between athletes using the tabs below.
        </Typography>
      </Box>

      {success && <Typography color="success">{success}</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <StyledTabs value={activeTab} onChange={handleChange} centered>
        {athletes.map((athlete) => (
          <Tab key={athlete.id} label={athlete.name} />
        ))}
      </StyledTabs>

      {athletes[activeTab] && (
        <StyledTabPanel>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {athletes[activeTab].name}
          </Typography>
          <Select
            value={reports.find((report) => report.athleteId === athletes[activeTab].id)?.reviewedAthleteId || athletes[activeTab].id}
            onChange={(e) => handleInputChange(athletes[activeTab].id, 'reviewedAthleteId', Number(e.target.value))}
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
              value={reports.find((report) => report.athleteId === athletes[activeTab].id)?.teamObservation || ''}
              onChange={(e) => handleInputChange(athletes[activeTab].id, 'teamObservation', e.target.value)}
              margin="normal"
            />
        </StyledTabPanel>
      )}
        <Box display="flex" justifyContent="space-between" marginTop={4}>
          <Button variant="contained" color="primary" onClick={handleSaveReports}>
            Save Reports
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </Box>
    </Container>
  );
};

export default AthletesReportPage;
