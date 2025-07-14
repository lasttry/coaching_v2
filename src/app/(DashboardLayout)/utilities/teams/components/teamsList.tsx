'use client';

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { TeamInterface } from '@/types/teams/types';
import { isNumber } from 'lodash';
import { EchelonInterface } from '@/types/echelons/types';
import { AthleteInterface } from '@/types/games/types';
import { log } from '@/lib/logger';

interface TeamsListProps {
  echelons: EchelonInterface[];
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  teams: TeamInterface[] | null;
  setEditedTeams: React.Dispatch<React.SetStateAction<{ [key: number]: TeamInterface }>>;
  editedTeams: { [key: number]: TeamInterface };
  onSaveTeam: (id: number) => void;
  onDeleteTeam: (id: number) => void;
  athletes: AthleteInterface[];
}

const TeamsListComponent: React.FC<TeamsListProps> = ({
  setErrorMessage,
  teams,
  setEditedTeams,
  editedTeams,
  echelons,
  onSaveTeam,
  onDeleteTeam,
  athletes,
}) => {
  const { t } = useTranslation();

  const [editMode, setEditMode] = React.useState<{ [key: number]: boolean }>({});
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);

  const toggleEditMode = (id: number | null): void => {
    if (!id) return;
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    const team = teams?.find((t) => t.id === id);
    setEditedTeams((prev) => {
      const updated = { ...prev };
      if (!prev[id] && team) {
        updated[id] = { ...team };
      }
      return updated;
    });
  };

  const handleSaveTeam = (id: number | null): void => {
    if (!id) return;
    onSaveTeam(id);
    toggleEditMode(id);
  };

  const handleDeleteTeam = (id: number | null): void => {
    if (!id) {
      setErrorMessage('No Team ID defined.');
      return;
    }
    setDeleteConfirm(id);
  };

  const handleCancelEdit = (id: number | null): void => {
    if (!id) return;
    toggleEditMode(id);
    setEditedTeams((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const calculateAge = (birthdate: string): number => {
    const birthYear = new Date(birthdate).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  const handleToggle = async (teamId: number | null, athleteId: number | null): Promise<void> => {
    if (teamId === null || athleteId === null) {
      return;
    }
    setEditedTeams((prev) => {
      const currentTeam = prev[teamId];
      if (!currentTeam) return prev;

      const exists = currentTeam.athletes.some((a) => a.athleteId === athleteId);

      const updatedAthletes = exists
        ? currentTeam.athletes.filter((a) => a.athleteId !== athleteId)
        : [
            ...currentTeam.athletes,
            { athleteId, athlete: athletes.find((a) => a.id === athleteId)! },
          ];

      return {
        ...prev,
        [teamId]: {
          ...currentTeam,
          athletes: updatedAthletes,
        },
      };
    });

    try {
      const method = editedTeams[teamId]?.athletes.some((a) => a.athleteId === athleteId)
        ? 'DELETE'
        : 'POST';
      const response = await fetch(`/api/teams/${teamId}/${athleteId}`, {
        method,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = `Failed to ${method === 'POST' ? 'add' : 'remove'} athlete, status: ${data.error}`;
        log.error(errorText);
        setErrorMessage(errorText);
        return;
      }

    } catch (error) {
      log.error('Error toggling athlete:', error);
      setErrorMessage('An unexpected error occurred.');
    }
  };

  return (
    <>
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('deleteConfirmationMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>{t('Cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteConfirm !== null) {
                onDeleteTeam(deleteConfirm);
                setDeleteConfirm(null);
              }
            }}
            color="error"
            variant="contained"
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {teams &&
        teams.map((team) => (
          <Accordion key={team.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={4}>
                  <Typography>{team.name}</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography>{team.echelon?.name}</Typography>
                </Grid>
                <Grid size={4}>
                  <Typography>
                    {t('athletes')}: {team.athletes.length}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              {isNumber(team.id) && editMode[team.id] ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label={t('name')}
                      value={editedTeams[team.id]?.name || team.name}
                      onChange={(e) =>
                        setEditedTeams((prev) => ({
                          ...prev,
                          [Number(team.id)]: {
                            ...prev[Number(team.id)],
                            name: e.target.value,
                          },
                        }))
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Select
                      value={editedTeams[team.id]?.echelonId || team.echelonId}
                      onChange={(e) =>
                        setEditedTeams((prev) => ({
                          ...prev,
                          [Number(team.id)]: {
                            ...prev[Number(team.id)],
                            echelonId: Number(e.target.value),
                          },
                        }))
                      }
                      fullWidth
                    >
                      {echelons.map((echelon) => (
                        <MenuItem key={echelon.id} value={String(echelon.id)}>
                          {echelon.name} (Max Age: {echelon.maxAge})
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid size={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {t('currentAthletes')}
                    </Typography>
                    <ul style={{ margin: 0, paddingInlineStart: 16 }}>
                      {editedTeams[team.id]?.athletes.map(({ athlete }) => (
                        <li
                          key={athlete.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>
                            {athlete.name} ({calculateAge(athlete.birthdate)} {t('yearsOld')})
                          </span>
                          <Button
                            variant="text"
                            color="error"
                            size="small"
                            onClick={() => handleToggle(team.id, athlete.id)}
                          >
                            {t('remove')}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </Grid>
                  <Grid size={12}>
                    <Typography sx={{ mb: 1 }}>{t('addAthlete')}</Typography>
                    <Select
                      displayEmpty
                      fullWidth
                      value=""
                      onChange={(e) => handleToggle(team.id, Number(e.target.value))}
                      renderValue={() => t('selectAthlete')}
                    >
                      {athletes
                        .filter((athlete) => {
                          if (team.id === null) return false;
                          const alreadyInTeam = editedTeams[team.id]?.athletes.some(
                            (a) => a.athleteId === athlete.id
                          );
                          const athleteAge = calculateAge(athlete.birthdate);
                          const maxAge = team.echelon?.maxAge ?? 100;
                          return !alreadyInTeam && athleteAge <= maxAge + 1;
                        })
                        .map((athlete) => (
                          <MenuItem key={athlete.id} value={athlete.id ?? ''}>
                            {athlete.name} ({calculateAge(athlete.birthdate)} {t('yearsOld')})
                          </MenuItem>
                        ))}
                    </Select>
                  </Grid>
                  <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      onClick={() => handleSaveTeam(team.id)}
                      disabled={
                        !editedTeams[team.id] || Object.keys(editedTeams[team.id]).length === 0
                      }
                    >
                      {t('save')}
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{ marginLeft: 2 }}
                      onClick={() => handleCancelEdit(team.id)}
                    >
                      {t('cancel')}
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {t('athletes')}
                    </Typography>
                    <ul style={{ margin: 0, paddingInlineStart: 16 }}>
                      {team.athletes.map(({ athlete }) => (
                        <li key={athlete.id}>{athlete.name}</li>
                      ))}
                    </ul>
                  </Grid>
                  <Grid size={12}>
                    <Button variant="outlined" onClick={() => toggleEditMode(team.id)}>
                      {t('edit')}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      sx={{ marginLeft: 2 }}
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      {t('Delete')}
                    </Button>
                  </Grid>
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
    </>
  );
};

TeamsListComponent.displayName = 'Team List';
export default TeamsListComponent;
