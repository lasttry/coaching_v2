'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { Button, Box, Stack, Typography, TextField, Select, MenuItem, InputLabel, FormHelperText, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import { SelectChangeEvent } from '@mui/material';


// Define the types for the form data
interface GameFormData {
  number?: number;
  date: string;
  away: boolean;
  competition?: string;
  subcomp?: string;
  oponentId: number;
  notes?: string;
  athleteIds: number[]; // Selected athletes
}

interface Team {
  id: number;
  name: string;
}

interface Athlete {
  id: number;
  name: string;
  number: string;
  birthdate: string; // Athlete's birthdate
}

const NewGame = () => {
  const [form, setForm] = useState<GameFormData>({
    date: dayjs().format('YYYY-MM-DDTHH:mm'),
    away: false,
    oponentId: 0,
    athleteIds: [], // Initialize as empty array
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<Athlete[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Fetch available teams and athletes
  useEffect(() => {
    async function fetchTeamsAndAthletes() {
      try {
        const [teamRes, athleteRes] = await Promise.all([
          fetch('/api/teams'),
          fetch('/api/athletes'),
        ]);
        const teamsData: Team[] = await teamRes.json();
        const athletesData: Athlete[] = await athleteRes.json();

        setTeams(teamsData);
        setAvailableAthletes(sortAthletes(athletesData));
      } catch (err) {
        setError('Failed to fetch data.');
      }
    }

    fetchTeamsAndAthletes();
  }, []);

  // Sort athletes by number, year of birth, and name
  const sortAthletes = (athletes: Athlete[]) => {
    return athletes.sort((a, b) => {
      const numberCompare = parseInt(a.number) - parseInt(b.number);
      if (numberCompare !== 0) return numberCompare;

      const yearCompare = dayjs(a.birthdate).year() - dayjs(b.birthdate).year();
      if (yearCompare !== 0) return yearCompare;

      return a.name.localeCompare(b.name);
    });
  };

  // Handle input change for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' })); // Clear any errors for this field
  };

  const handleOpponentChange = (e: SelectChangeEvent<number>) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      oponentId: Number(value), // Ensure value is treated as a number
    }));
  };
  
  const handleAwayChange = (e: SelectChangeEvent<string>) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      away: value === "true", // Convert string "true"/"false" back to boolean
    }));
  };

  // Add athlete to selected list
  const handleAddAthlete = (athlete: Athlete) => {
    const updatedSelected = [...selectedAthletes, athlete];
    const updatedAvailable = availableAthletes.filter((a) => a.id !== athlete.id);

    setSelectedAthletes(sortAthletes(updatedSelected)); // Add to selected list and sort
    setAvailableAthletes(sortAthletes(updatedAvailable)); // Remove from available list and sort
    setForm((prev) => ({ ...prev, athleteIds: [...prev.athleteIds, athlete.id] }));
  };

  // Remove athlete from selected list
  const handleRemoveAthlete = (athlete: Athlete) => {
    const updatedAvailable = [...availableAthletes, athlete];
    const updatedSelected = selectedAthletes.filter((a) => a.id !== athlete.id);

    setAvailableAthletes(sortAthletes(updatedAvailable)); // Add back to available list and sort
    setSelectedAthletes(sortAthletes(updatedSelected)); // Remove from selected list and sort
    setForm((prev) => ({
      ...prev,
      athleteIds: prev.athleteIds.filter((id) => id !== athlete.id),
    }));
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.date) {
      errors.date = 'Game date is required';
    }

    if (form.oponentId === 0) {
      errors.oponentId = 'Opponent is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSuccess('Game created successfully.');
        setError(null);
        setTimeout(() => {
          router.push('/utilities/games');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create game.');
      }
    } catch (err) {
      console.error('Error creating game:', err);
      setError('An unknown error occurred.');
    }
  };

  return (
    <PageContainer title="Create New Game" description="Add a new game">
      <h1>Create New Game</h1>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Date Field */}
          <TextField
            label="Game Date"
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            error={!!formErrors.date}
            helperText={formErrors.date}
            required
          />

          {/* Away Game Toggle */}
          <Box>
            <InputLabel>Away Game</InputLabel>
            <Select
              name="away"
              value={form.away ? "true" : "false"} // Convert boolean to string for the select
              onChange={(e) => handleAwayChange(e)} // Use a specific handler for this
            >
              <MenuItem value="false">Home</MenuItem>
              <MenuItem value="true">Away</MenuItem>
            </Select>
          </Box>

          {/* Opponent Selection */}
          <Box>
            <InputLabel>Opponent</InputLabel>
            <Select
              name="oponentId"
              value={form.oponentId} // Ensure this is a number
              onChange={handleOpponentChange} // Use a specific handler for numeric Select
              error={!!formErrors.oponentId}
            >
              <MenuItem value={0}>
                <em>Select Opponent</em>
              </MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
            {formErrors.oponentId && <FormHelperText error>{formErrors.oponentId}</FormHelperText>}
          </Box>


          {/* Competition Field */}
          <TextField
            label="Competition"
            name="competition"
            value={form.competition || ''}
            onChange={handleChange}
          />

          {/* Subcompetition Field */}
          <TextField
            label="Subcompetition"
            name="subcomp"
            value={form.subcomp || ''}
            onChange={handleChange}
          />

          {/* Notes Field */}
          <TextField
            label="Notes"
            name="notes"
            value={form.notes || ''}
            multiline
            rows={4}
            onChange={handleChange}
          />

          {/* Athlete Table */}
          <Box marginY={4}>
            <Typography variant="h6" gutterBottom>
              Athletes
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Birth Year</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Selected athletes */}
                {selectedAthletes.map((athlete) => (
                  <TableRow key={athlete.id}>
                    <TableCell>{athlete.number}</TableCell>
                    <TableCell>{athlete.name}</TableCell>
                    <TableCell>{dayjs(athlete.birthdate).year()}</TableCell>
                    <TableCell>Selected</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleRemoveAthlete(athlete)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* Available athletes */}
                {availableAthletes.map((athlete) => (
                  <TableRow key={athlete.id}>
                    <TableCell>{athlete.number}</TableCell>
                    <TableCell>{athlete.name}</TableCell>
                    <TableCell>{dayjs(athlete.birthdate).year()}</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleAddAthlete(athlete)}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="space-between">
            <Button type="submit" variant="contained" color="primary">
              Create Game
            </Button>

            <Button type="button" variant="outlined" color="secondary" onClick={() => router.push('/utilities/games')}>
              Cancel
            </Button>
          </Box>

          {/* Success/Error Messages */}
          {success && <Typography sx={{ color: 'green' }}>{success}</Typography>}
          {error && <Typography sx={{ color: 'red' }}>{error}</Typography>}
        </Stack>
      </form>
    </PageContainer>
  );
};

export default NewGame;
