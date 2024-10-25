'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Tab, Tabs, TextField, Stack, Typography, CircularProgress } from '@mui/material';
import { useParams } from 'next/navigation';
import Papa from 'papaparse'; // For CSV parsing
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer'; // Import PageContainer component

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
  const gameId = Number(params?.id);

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [reports, setReports] = useState<Record<number, Report>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<number, Record<string, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Fetch athletes and existing reports for the game
    async function fetchData() {
      try {
        const athletesRes = await fetch(`/api/athletes`);  // Fetch all athletes
        if (!athletesRes.ok) {
          throw new Error('Failed to fetch athletes');
        }
        const athletesData = await athletesRes.json();
        setAthletes(athletesData);

        const reportsRes = await fetch(`/api/games/${gameId}/reports`);
        if (!reportsRes.ok) {
          throw new Error('Failed to fetch reports');
        }
        const reportsData: Report[] = await reportsRes.json();

        // Map reports by athleteId for easier access
        const reportsMap = reportsData.reduce((acc, report) => {
          acc[report.athleteId] = report;
          return acc;
        }, {} as Record<number, Report>);

        setReports(reportsMap);
        console.log(reportsMap)
      } catch (error: any) {
        console.error('Failed to load athletes or reports:', error);
        setError(error.message);
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
          setError(null);
          
          // Reload reports data after successful upload
          const reportsRes = await fetch(`/api/games/${gameId}/reports`);
          if (reportsRes.ok) {
            const reportsData: Report[] = await reportsRes.json();
            const reportsMap = reportsData.reduce((acc, report) => {
              acc[report.athleteId] = report;
              return acc;
            }, {} as Record<number, Report>);
            setReports(reportsMap);
          }
        } else {
          const errorData = await response.json();
          setError(`Failed to process reports: ${errorData.error || 'Unknown error'}`);
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

    // Clear error for the field
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [athleteId]: {
        ...prevErrors[athleteId],
        [field]: '',
      },
    }));
  };

  const validateReports = () => {
    let isValid = true;
    const errors: Record<number, Record<string, string>> = {};

    athletes.forEach((athlete) => {
      const report = reports[athlete.id];
      const athleteErrors: Record<string, string> = {};

      if (!report || !report.teamObservation) {
        athleteErrors.teamObservation = 'Team observation is required';
        isValid = false;
      }
      if (!report || !report.individualObservation) {
        athleteErrors.individualObservation = 'Individual observation is required';
        isValid = false;
      }
      if (!report || !report.timePlayedObservation) {
        athleteErrors.timePlayedObservation = 'Time played observation is required';
        isValid = false;
      }

      if (Object.keys(athleteErrors).length > 0) {
        errors[athlete.id] = athleteErrors;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSaveReports = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateReports()) {
      setError('Please fill in all required fields.');
      return;
    }

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
        setError(null);
      } else {
        const errorData = await response.json();
        setError(`Failed to save reports: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Failed to save reports:', error);
      setError('Failed to save reports. Please try again.');
    }
  };

  const handleCancel = () => {
    // Logic to handle cancel action, e.g., navigate back or reset form
    window.history.back();
  };

  const checkReportComplete = (athleteId: number) => {
    const report = reports[athleteId];
    console.log(`${athleteId}: ${reports[athleteId]}`)
    return report && report.teamObservation && report.individualObservation && report.timePlayedObservation;
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  return (
    <PageContainer title="Athlete Reports" description="Enter or update reports for athletes">
      <form onSubmit={handleSaveReports}>
        <Stack spacing={3}>
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

          {error && <Typography sx={{ color: 'red' }}>{error}</Typography>}
          {success && <Typography sx={{ color: 'green' }}>{success}</Typography>}

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
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
            activeTab === index && (
              <Box
                key={athlete.id}
                padding={2}
                border="1px solid gray"
                marginTop={2}
              >
                <Typography variant="h5">
                  {athlete.number} - {athlete.name}
                </Typography>
                <Typography variant="h5">
                  {reports[athlete.id]?.reviewdAthlete.name}
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Team Observation"
                    name="teamObservation"
                    multiline
                    minRows={3}
                    fullWidth
                    value={reports[athlete.id]?.teamObservation || ''}
                    onChange={(e) => handleInputChange(athlete.id, 'teamObservation', e.target.value)}
                    error={!!formErrors[athlete.id]?.teamObservation}
                    helperText={formErrors[athlete.id]?.teamObservation}
                  />
                  <TextField
                    label="Individual Observation"
                    name="individualObservation"
                    multiline
                    minRows={3}
                    fullWidth
                    value={reports[athlete.id]?.individualObservation || ''}
                    onChange={(e) => handleInputChange(athlete.id, 'individualObservation', e.target.value)}
                    error={!!formErrors[athlete.id]?.individualObservation}
                    helperText={formErrors[athlete.id]?.individualObservation}
                  />
                  <TextField
                    label="Time Played Observation"
                    name="timePlayedObservation"
                    multiline
                    minRows={3}
                    fullWidth
                    value={reports[athlete.id]?.timePlayedObservation || ''}
                    onChange={(e) => handleInputChange(athlete.id, 'timePlayedObservation', e.target.value)}
                    error={!!formErrors[athlete.id]?.timePlayedObservation}
                    helperText={formErrors[athlete.id]?.timePlayedObservation}
                  />
                </Stack>
              </Box>
            )
          ))}

          <Box display="flex" justifyContent="space-between" marginTop={4}>
            <Button type="submit" variant="contained" color="primary">
              Submit Reports
            </Button>
            <Button type="button" variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Stack>
      </form>
    </PageContainer>
  );
};

export default GameReports;
