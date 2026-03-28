'use client';
import React, { useState, useEffect } from 'react';
import { log } from '@/lib/logger';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';

import dayjs from 'dayjs';

import { TeamInterface } from '@/types/teams/types';
import { EchelonInterface } from '@/types/echelons/types';
import { SeasonInterface } from '@/types/season/types';

import '@/lib/i18n.client'; // garante inicialização só no cliente
import { useTranslation } from 'react-i18next';
import { AthleteInterface } from '@/types/athlete/types';

export default function TeamsPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [teams, setTeams] = useState<TeamInterface[]>([]);
  const [echelons, setEchelons] = useState<EchelonInterface[]>([]);
  const [athletes, setAthletes] = useState<AthleteInterface[]>([]);
  const [currentSeason, setCurrentSeason] = useState<SeasonInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTeam, setFormTeam] = useState<Partial<TeamInterface>>({
    name: '',
    type: 'OTHER',
    echelonId: 0,
  });
  const [editingTeam, setEditingTeam] = useState<TeamInterface | null>(null);

  const [athletesDialogOpen, setAthletesDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamInterface | null>(null);
  const [selectedAthletes, setSelectedAthletes] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });

  useEffect(() => {
    let active = true;

    const load = async (): Promise<void> => {
      try {
        const [teamsRes, echelonsRes, athletesRes, seasonRes] = await Promise.all([
          fetch('/api/teams'),
          fetch('/api/echelons'),
          fetch('/api/athletes'),
          fetch('/api/seasons/current'),
        ]);
        if (!active) return;

        const [teams, echelons, athletes] = await Promise.all([
          teamsRes.json(),
          echelonsRes.json(),
          athletesRes.json(),
        ]);

        const season = seasonRes.ok ? await seasonRes.json() : null;

        setTeams(teams);
        setEchelons(echelons);
        setAthletes(athletes);
        setCurrentSeason(season);
      } catch (err) {
        log.error('Error loading teams data:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  // CRUD Team
  const handleSave = async (): Promise<void> => {
    if (!formTeam.name || !formTeam.echelonId) return;

    if (editingTeam) {
      await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formTeam),
      });
    } else {
      await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formTeam),
      });
    }
    setDialogOpen(false);
    setEditingTeam(null);
    setFormTeam({ name: '', type: 'OTHER', echelonId: 0 });
    const data = await fetch('/api/teams').then((res) => res.json());
    setTeams(data);
  };

  const handleEdit = (team: TeamInterface): void => {
    setEditingTeam(team);
    setFormTeam(team);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number | null): Promise<void> => {
    if (id === null) return;
    await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  // Manage Athletes
  const openAthletesDialog = (team: TeamInterface): void => {
    setSelectedTeam(team);
    const preselected = team.athletes?.map((a) => a.athleteId) ?? [];
    setSelectedAthletes({ type: 'include', ids: new Set(preselected) });
    setAthletesDialogOpen(true);
  };

  const handleSaveAthletes = async (): Promise<void> => {
    if (!selectedTeam) return;
    await fetch(`/api/teams/${selectedTeam.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        athleteIds: Array.from(selectedAthletes.ids).map((id) => Number(id)),
      }),
    });
    setAthletesDialogOpen(false);
    setSelectedTeam(null);
    const data = await fetch('/api/teams').then((res) => res.json());
    setTeams(data);
  };

  const getFederativeAge = (birthdate: string): number => {
    // Idade federativa = ano de início da época - ano de nascimento
    const seasonStartYear = currentSeason?.startDate
      ? dayjs(currentSeason.startDate).year()
      : dayjs().year();
    const birthYear = dayjs(birthdate).year();
    return seasonStartYear - birthYear;
  };

  // Columns Teams
  const teamColumns: GridColDef<TeamInterface>[] = [
    { field: 'name', headerName: t('Name'), flex: 1 },
    { field: 'type', headerName: t('Type'), width: 120 },
    {
      field: 'echelon',
      headerName: t('Echelon'),
      flex: 1,
      valueGetter: (_value: EchelonInterface) => _value.name ?? '-',
    },
    {
      field: 'athletes',
      headerName: t('Athletes'),
      width: 120,
      valueGetter: (_value: AthleteInterface[]) => _value.length ?? 0,
    },
    {
      field: 'actions',
      headerName: t('Actions'),
      width: 160,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => openAthletesDialog(params.row as TeamInterface)}>
            <PeopleIcon />
          </IconButton>
          <IconButton onClick={() => handleEdit(params.row as TeamInterface)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const athleteColumns: GridColDef<AthleteInterface>[] = [
    { field: 'name', headerName: t('Name'), flex: 1 },
    {
      field: 'birthdate',
      headerName: t('Birthdate'),
      flex: 1,
      valueFormatter: (_value) => dayjs(_value as string).format('YYYY-MM-DD'),
    },
    {
      field: 'age',
      headerName: t('Age'),
      width: 100,
      valueGetter: (_value, row: AthleteInterface) => getFederativeAge(row.birthdate),
    },
  ];

  return (
    <Box>
      {/* Header with Add Button */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">{t('teamsManagement')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          {t('addTeam')}
        </Button>
      </Box>

      {/* Teams DataGrid */}
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={teams}
          columns={teamColumns}
          loading={loading}
          getRowId={(row) => Number(row.id)}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
        />
      </Box>

      {/* Add/Edit Team Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingTeam ? t('editTeam') : t('addTeam')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('Name')}
            value={formTeam.name ?? ''}
            onChange={(e) => setFormTeam({ ...formTeam, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Select
            fullWidth
            value={formTeam.type ?? 'OTHER'}
            onChange={(e) =>
              setFormTeam({ ...formTeam, type: e.target.value as 'A' | 'B' | 'OTHER' })
            }
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="OTHER">{'other'}</MenuItem>
          </Select>
          <Select
            fullWidth
            value={formTeam.echelonId ?? 0}
            onChange={(e) => setFormTeam({ ...formTeam, echelonId: Number(e.target.value) })}
          >
            {echelons.map((e) => (
              <MenuItem key={Number(e.id)} value={String(e.id)}>
                {e.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Athletes Manager Dialog */}
      <Dialog
        open={athletesDialogOpen}
        onClose={() => setAthletesDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {t('manageAthletes')} {selectedTeam ? `${t('for')} ${selectedTeam.name}` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400 }}>
            <DataGrid
              rows={(athletes ?? [])
                .map((a) => ({
                  ...a,
                  age: getFederativeAge(a.birthdate),
                }))
                .filter((a) => {
                  const echelon = selectedTeam?.echelon;
                  if (!echelon) return true;

                  const minAge = echelon.minAge ?? 0; // fallback seguro
                  const maxAge = echelon.maxAge ?? 100; // fallback seguro

                  return a.age >= minAge && a.age <= maxAge;
                })}
              columns={athleteColumns}
              checkboxSelection
              getRowId={(row) => Number(row.id)}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              rowSelectionModel={selectedAthletes}
              onRowSelectionModelChange={(newSelection) => {
                // Sem qualquer validação/filtro
                setSelectedAthletes(newSelection);
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAthletesDialogOpen(false)}>{t('Cancel')}</Button>
          <Button variant="contained" onClick={handleSaveAthletes}>
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
