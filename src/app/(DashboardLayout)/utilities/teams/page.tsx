'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { log } from '@/lib/logger';
import { AthleteInterface } from '@/types/games/types';
import { TeamInterface } from '@/types/teams/types';
import { EchelonInterface } from '@/types/echelons/types';

const TeamsPage = (): ReactElement => {
  const { data: session } = useSession();

  const [echelons, setEchelons] = useState<EchelonInterface[]>([]);
  const [teams, setTeams] = useState<TeamInterface[]>([]);
  const [athletes, setAthletes] = useState<AthleteInterface[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamInterface | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: '',
    echelonId: '', // Default to an empty string
    clubId: '', // Will be updated with session data
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTeams();
    fetchAthletes();
    fetchEchelons();
  }, []);

  const fetchEchelons = async (): Promise<void> => {
    try {
      const response = await fetch('/api/echelons');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch echelons');
      }
      setEchelons(data);
    } catch (error) {
      log.error('Failed to fetch echelons:', error);
      setErrorMessage('Failed to load echelons.');
      setTimeout(() => setErrorMessage(''), 10000);
    }
  };

  const fetchTeams = async (): Promise<void> => {
    try {
      const response = await fetch('/api/teams');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTeams(data);
    } catch (error) {
      log.error('Failed to fetch teams:', error);
      setErrorMessage('An error occurred while fetching teams');
      setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10 seconds
    }
  };

  const fetchAthletes = async (): Promise<void> => {
    try {
      const response = await fetch('/api/athletes');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAthletes(data);
    } catch (error) {
      log.error('Failed to fetch teams:', error);
      setErrorMessage('An error occurred while fetching teams');
      setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10 seconds
    }
  };

  const handleFormChange = (e): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateTeam = async (): Promise<void> => {
    try {
      if (!session?.user?.selectedClubId) {
        throw new Error('Club ID is missing from the session');
      }
      const teamData = { ...form, clubId: session.user.selectedClubId };

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSuccessMessage('Team created successfully');
      fetchTeams();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      log.error('Failed to fetch teams:', error);
      setErrorMessage('An error occurred while fetching teams');
      setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10 seconds
    }
  };

  const handleAddAthlete = async (athleteId: number | null): Promise<void> => {
    if (!selectedTeam) return;
    const athlete = athletes.find((a) => a.id === athleteId);
    if (!athlete) {
      return;
    }
    const age = dayjs().diff(dayjs(athlete.birthdate), 'year');

    const teamEchelon = selectedTeam.echelon;
    if (teamEchelon.maxAge && age > teamEchelon.maxAge) {
      setErrorMessage(`Athlete age exceeds maximum age (${teamEchelon.maxAge})`);
      setTimeout(() => setErrorMessage(''), 10000);
      return;
    }

    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteIds: [athleteId], action: 'add' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSuccessMessage('Athlete added successfully');
      fetchTeams();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      log.error('Failed to fetch teams:', error);
      setErrorMessage('An error occurred while fetching teams');
      setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10 seconds
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Manage Teams
      </Typography>

      {/* Success/Error Messages */}
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : <></>}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : <></>}

      {/* Teams List */}
      <Grid container spacing={2}>
        {teams.map((team) => (
          <Grid key={team.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Box
              p={2}
              border={1}
              borderRadius={2}
              onClick={() => setSelectedTeam(team)}
              sx={{
                cursor: 'pointer',
                borderColor: selectedTeam?.id === team.id ? 'primary.main' : 'grey.300',
              }}
            >
              <Typography variant="h6">{team.name}</Typography>
              <Typography variant="body2">Type: {team.type}</Typography>
              <Typography variant="body2">Echelon: {team.echelon?.name}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Add Team Dialog */}
      <Button variant="contained" onClick={() => setDialogOpen(true)} sx={{ mt: 3 }}>
        Add Team
      </Button>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add New Team</DialogTitle>
        <DialogContent>
          {/* Team Name */}
          <TextField fullWidth margin="dense" label="Team Name" name="name" value={form.name} onChange={handleFormChange} />

          {/* Team Type */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Type</InputLabel>
            <Select name="type" value={form.type} onChange={handleFormChange} displayEmpty>
              <MenuItem value="A">Team A</MenuItem>
              <MenuItem value="B">Team B</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </Select>
          </FormControl>

          {/* Echelon Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Echelon</InputLabel>
            <Select
              name="echelonId"
              value={form.echelonId || ''} // Ensure value is a string or number, not null
              onChange={handleFormChange}
              displayEmpty
            >
              <MenuItem value="">
                <em>None</em> {/* Placeholder for unselected state */}
              </MenuItem>
              {echelons.map((echelon) => (
                <MenuItem key={echelon.id} value={echelon.id}>
                  {echelon.name} (Max Age: {echelon.maxAge})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTeam}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Athletes List for Adding */}
      {selectedTeam && (
        <>
          <Typography variant="h5" mt={4}>
            Add Athletes to {selectedTeam.name}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Birthdate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {athletes.map((athlete) => (
                <TableRow key={athlete.id}>
                  <TableCell>{athlete.name}</TableCell>
                  <TableCell>{dayjs(athlete.birthdate).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleAddAthlete(athlete.id)}
                      disabled={selectedTeam.athletes.some((a) => a.athleteId === athlete.id)}
                    >
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Box>
  );
};

export default TeamsPage;
