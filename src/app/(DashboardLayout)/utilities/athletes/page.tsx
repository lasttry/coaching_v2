'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Typography,
  Modal,
  Box,
  TextField,
  Alert,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';

// Define the Athlete type based on the schema
interface Athlete {
  id: number;
  number: string;
  name: string;
  birthdate: string;
  fpbNumber?: number | null;
}

const AthletesList = (): ReactElement => {
  const { t } = useTranslation();

  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAthlete, setCurrentAthlete] = useState<Athlete | null>(null);

  // Fetch athletes when the component mounts
  useEffect(() => {
    async function fetchAthletes(): Promise<void> {
      try {
        const response = await fetch('/api/athletes');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || t('failedFetchAthlete'));
        }

        setAthletes(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        log.error('Error fetching athletes:', errorMessage);
        setErrorMessage(errorMessage);
      }
    }
    fetchAthletes();
  }, [t, currentAthlete]);

  // Handle opening the modal for editing
  const handleEdit = (athlete: Athlete): void => {
    setCurrentAthlete(athlete);
    setIsModalOpen(true);
  };

  // Handle adding or updating an athlete
  const handleSaveAthlete = async (): Promise<void> => {
    try {
      const method = currentAthlete?.id ? 'PUT' : 'POST';
      const url = currentAthlete?.id ? `/api/athletes/${currentAthlete.id}` : '/api/athletes';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentAthlete),
      });

      const data = await response.json();

      if (!response.ok) {
        log.error(data);
        throw new Error(data.error);
      }

      if (data?.id) {
        // Update existing athlete in the list
        setAthletes((prev) => prev.map((athlete) => (athlete.id === data.id ? data : athlete)));
        setSuccessMessage('Athlete updated successfully!');
      } else {
        // Add new athlete to the list
        setAthletes((prev) => [...prev, data]);
        setSuccessMessage('Athlete added successfully!');
      }

      setErrorMessage(null);
      setIsModalOpen(false);
      setCurrentAthlete(null);

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(errorMessage);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Function to delete an athlete
  const handleDelete = async (id: number, name: string): Promise<void> => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the athlete ${name}?`);

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/athletes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAthletes((prev) => prev.filter((athlete) => athlete.id !== id));
        setSuccessMessage(`Athlete ${name} deleted successfully.`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData?.error || 'Failed to delete athlete.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (err) {
      log.error('Error deleting athlete:', err);
      setErrorMessage('An unexpected error occurred.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <PageContainer title="Athletes" description="List of athletes">
      <h1>Athletes</h1>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setCurrentAthlete(null); // Reset to add new athlete
          setIsModalOpen(true);
        }}
      >
        Add New Athlete
      </Button>

      {successMessage ? <Alert severity="success">{successMessage}</Alert> : <></>}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : <></>}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Birthdate</TableCell>
              <TableCell>FPB Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(athletes) &&
              athletes.map((athlete) => (
                <TableRow key={athlete.id}>
                  <TableCell>{athlete.number}</TableCell>
                  <TableCell>{athlete.name}</TableCell>
                  <TableCell>{new Date(athlete.birthdate).toLocaleDateString()}</TableCell>
                  <TableCell>{athlete.fpbNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" color="primary" onClick={() => handleEdit(athlete)}>
                        Edit
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => handleDelete(athlete.id, athlete.name)}>
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Adding/Editing Athlete */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>
            {currentAthlete?.id ? 'Edit Athlete' : 'Add New Athlete'}
          </Typography>
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : <></>}
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : <></>}
          <TextField
            fullWidth
            label="Number"
            value={currentAthlete?.number || ''}
            onChange={(e) =>
              setCurrentAthlete((prev) => ({
                ...prev!,
                number: e.target.value,
              }))
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Name"
            value={currentAthlete?.name || ''}
            onChange={(e) =>
              setCurrentAthlete((prev) => ({
                ...prev!,
                name: e.target.value,
              }))
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Birthdate"
            type="date"
            value={currentAthlete?.birthdate ? new Date(currentAthlete.birthdate).toISOString().split('T')[0] : ''}
            onChange={(e) =>
              setCurrentAthlete((prev) => ({
                ...prev!,
                birthdate: e.target.value,
              }))
            }
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
          <TextField
            fullWidth
            label="FPB Number"
            type="number"
            value={currentAthlete?.fpbNumber || ''}
            onChange={(e) =>
              setCurrentAthlete((prev) => ({
                ...prev!,
                fpbNumber: e.target.value ? Number(e.target.value) : null,
              }))
            }
            margin="normal"
          />
          <Stack direction="row" spacing={2} mt={2}>
            <Button variant="contained" color="primary" onClick={handleSaveAthlete}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </PageContainer>
  );
};

export default AthletesList;
