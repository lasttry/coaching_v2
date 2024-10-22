'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Tab, Tabs, TextField, Stack, Typography, CircularProgress } from '@mui/material';
import { useParams } from 'next/navigation';
import { PrismaClient } from '@prisma/client'; // Import Prisma
import React from 'react';
import Papa from 'papaparse'; // For CSV parsing

// Define types for report fields
interface Athlete {
  id: number;
  name: string;
  number: string;
}

interface Report {
  id?: number;
  athleteId: number;
  gameId: number;
  teamObservation: string;
  individualObservation: string;
  timePlayedObservation: string;
}

const GameReports = () => {
  const params = useParams<{ id: string }>();
  const gameId = Number(params.id);

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [reports, setReports] = useState<Record<number, Report>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch athletes and existing reports for the game
    async function fetchData() {
      try {
        const athletesRes = await fetch(`/api/athletes`);  // Fetch all athletes, not just for a game
        const athletesData = await athletesRes.json();
        setAthletes(athletesData);  // Update state with all athletes

        const reportsRes = await fetch(`/api/games/${gameId}/reports`);
        const reportsData: Report[] = await reportsRes.json();

        // Map reports by athleteId for easier access
        const reportsMap = reportsData.reduce((acc, report) => {
          acc[report.athleteId] = report;
          return acc;
        }, {} as Record<number, Report>);

        setReports(reportsMap);
      } catch (error) {
        console.error('Failed to load athletes or reports:', error);
      }
    }

    fetchData();
  }, [gameId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    // Parse the CSV file using PapaParse
    Papa.parse(file, {
      header: true, // Use the first row as the header
      complete: async function(results) {
        const rows = results.data;
        
        // Process each row of the CSV and send it to the server for insertion/updating
        const response = await fetch(`/api/games/${gameId}/reports/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rows), // Send parsed rows to the API
        });

        if (response.ok) {
          setSuccess('Reports uploaded and processed successfully.');
        } else {
          setError('Failed to process reports. Please try again.');
        }

        setLoading(false);
      },
      error: function(err) {
        setError('Failed to parse the CSV file. Please try again.');
        setLoading(false);
      },
    });
  };

  const handleInputChange = (athleteId: number, field: keyof Report, value: string) => {
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

  const handleSaveReports = async () => {
    const reportsArray = Object.values(reports);
    try {
      await fetch(`/api/games/${gameId}/reports`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportsArray),
      });
      alert('Reports saved successfully');
    } catch (error) {
      console.error('Failed to save reports:', error);
    }
  };

  const checkReportComplete = (athleteId: number) => {
    const report = reports[athleteId];
    return report && report.teamObservation && report.individualObservation && report.timePlayedObservation;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Athlete Reports
      </Typography>
      <Box marginY={2}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </Box>

      <Stack direction="row" spacing={2} marginY={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFileUpload}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload CSV'}
        </Button>
      </Stack>

      {error && <Typography color="error">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {athletes.map((athlete, index) => (
          <Tab
            key={athlete.id}
            label={`${athlete.number} - ${athlete.name}`}
            style={{
              backgroundColor: checkReportComplete(athlete.id) ? 'green' : 'red',
              color: 'white',
            }}
          />
        ))}
      </Tabs>

      {athletes.map((athlete, index) => (
        <Box
          key={athlete.id}
          hidden={activeTab !== index}
          padding={2}
          border="1px solid gray"
          marginTop={2}
        >
          <Typography variant="h5">
            {athlete.number} - {athlete.name}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Team Observation"
              fullWidth
              value={reports[athlete.id]?.teamObservation || ''}
              onChange={(e) => handleInputChange(athlete.id, 'teamObservation', e.target.value)}
            />
            <TextField
              label="Individual Observation"
              fullWidth
              value={reports[athlete.id]?.individualObservation || ''}
              onChange={(e) => handleInputChange(athlete.id, 'individualObservation', e.target.value)}
            />
            <TextField
              label="Time Played Observation"
              fullWidth
              value={reports[athlete.id]?.timePlayedObservation || ''}
              onChange={(e) => handleInputChange(athlete.id, 'timePlayedObservation', e.target.value)}
            />
          </Stack>
        </Box>
      ))}

      <Stack direction="row" spacing={2} marginTop={4}>
        <Button variant="contained" color="primary" onClick={handleSaveReports}>
          Save Reports
        </Button>
      </Stack>
    </Box>
  );
};

export default GameReports;
