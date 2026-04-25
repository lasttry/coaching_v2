'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
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
import { Grid } from '@mui/material';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { log } from '@/lib/logger';
import { AthleteInterface } from '@/types/athlete/types';
import { TeamInterface } from '@/types/teams/types';
import { EchelonInterface } from '@/types/echelons/types';
import { SelectChangeEvent } from '@mui/material/Select';
import { useMessage } from '@/hooks/useMessage';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

const TeamsPage = (): ReactElement => {
  const { t } = useTranslation();
  const { data: session } = useSession();

  const [echelons, setEchelons] = useState<EchelonInterface[]>([]);
  const [teams, setTeams] = useState<TeamInterface[]>([]);
  const [athletes, setAthletes] = useState<AthleteInterface[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamInterface | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: '',
    echelonId: '',
    clubId: '',
  });
  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);

  const isFormDirty = useFormSnapshotDirty(dialogOpen, form);

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
    }
  };

  const fetchAthletes = async (): Promise<void> => {
    try {
      const response = await fetch('/api/athletes');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAthletes(data);
    } catch (error) {
      log.error('Failed to fetch athletes:', error);
      setErrorMessage('An error occurred while fetching athletes');
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
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
    } catch (error) {
      log.error('Failed to create team:', error);
      setErrorMessage('An error occurred while creating team');
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
    if (teamEchelon && teamEchelon.maxAge && age > teamEchelon.maxAge) {
      setErrorMessage(`Athlete age exceeds maximum age (${teamEchelon.maxAge})`);
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
    } catch (error) {
      log.error('Failed to add athlete:', error);
      setErrorMessage('An error occurred while adding athlete');
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
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
              onClick={() => setSelectedTeam(team)}
              sx={{
                p: 2,
                border: 1,
                borderRadius: 2,
                cursor: 'pointer',
                borderColor: selectedTeam?.id === team.id ? 'primary.main' : 'grey.300',
              }}
            >
              <Typography variant="h6">{team.name}</Typography>
              <Typography variant="body2">
                {t('common.type')}: {team.type}
              </Typography>
              <Typography variant="body2">
                {t('echelon.singular')}: {team.echelon?.name}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Add Team Dialog */}
      <Button variant="contained" onClick={() => setDialogOpen(true)} sx={{ mt: 3 }}>
        {t('team.add')}
      </Button>
      <GuardedDialog open={dialogOpen} onClose={() => setDialogOpen(false)} isDirty={isFormDirty}>
        <DialogTitle>{t('team.add')}</DialogTitle>
        <DialogContent>
          {/* Team Name */}
          <TextField
            fullWidth
            margin="dense"
            label={t('common.name')}
            name="name"
            value={form.name}
            onChange={handleFormChange}
          />

          {/* Team Type */}
          <FormControl fullWidth margin="dense">
            <InputLabel>{t('common.type')}</InputLabel>
            <Select name="type" value={form.type} onChange={handleFormChange} displayEmpty>
              <MenuItem value="A">{t('team.teamA')}</MenuItem>
              <MenuItem value="B">{t('team.teamB')}</MenuItem>
              <MenuItem value="OTHER">{t('common.other')}</MenuItem>
            </Select>
          </FormControl>

          {/* Echelon Dropdown */}
          <FormControl fullWidth margin="dense">
            <InputLabel>{t('echelon.singular')}</InputLabel>
            <Select
              name="echelonId"
              value={form.echelonId || ''}
              onChange={handleFormChange}
              displayEmpty
            >
              <MenuItem value="">
                <em>{t('common.none')}</em>
              </MenuItem>
              {echelons.map((echelon) => (
                <MenuItem key={echelon.id ?? 0} value={echelon.id ?? ''}>
                  {echelon.name} ({t('echelon.maxAge')}: {echelon.maxAge})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleCreateTeam}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      {/* Athletes List for Adding */}
      {selectedTeam && (
        <>
          <Typography variant="h5" sx={{ mt: 4 }}>
            {t('athlete.addTo')} {selectedTeam.name}
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('common.name')}</TableCell>
                <TableCell>{t('common.birthdate')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
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
                      {t('actions.add')}
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
