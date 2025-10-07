'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, IconButton, Select, MenuItem, TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
} from '@mui/x-data-grid';

import dayjs from 'dayjs';

import { TeamInterface } from '@/types/teams/types';
import { AthleteInterface } from '@/types/games/types';
import { EchelonInterface } from '@/types/echelons/types';

export default function TeamsPage(): React.JSX.Element {
  const [teams, setTeams] = useState<TeamInterface[]>([]);
  const [echelons, setEchelons] = useState<EchelonInterface[]>([]);
  const [athletes, setAthletes] = useState<AthleteInterface[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTeam, setFormTeam] = useState<Partial<TeamInterface>>({ name: '', type: 'OTHER', echelonId: 0 });
  const [editingTeam, setEditingTeam] = useState<TeamInterface | null>(null);

  const [athletesDialogOpen, setAthletesDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamInterface | null>(null);
  const [selectedAthletes, setSelectedAthletes] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  useEffect(() => {
    let active = true;

    const load = async (): Promise<void> => {
      try {
        const [teamsRes, echelonsRes, athletesRes] = await Promise.all([
          fetch('/api/teams'),
          fetch('/api/echelons'),
          fetch('/api/athletes')
        ]);
        if (!active) return; // evita update depois de desmontar

        const [teams, echelons, athletes] = await Promise.all([
          teamsRes.json(),
          echelonsRes.json(),
          athletesRes.json()
        ]);
        setTeams(teams);
        setEchelons(echelons);
        setAthletes(athletes);
      } catch (err) {
        console.error(err);
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
    const data = await fetch('/api/teams').then(res => res.json());
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
    setTeams(prev => prev.filter(t => t.id !== id));
  };

  // Manage Athletes
  const openAthletesDialog = (team: TeamInterface) => {
    setSelectedTeam(team);
    const preselected = team.athletes?.map(a => a.athleteId) ?? [];
    setSelectedAthletes({ type: 'include', ids: new Set(preselected) });
    setAthletesDialogOpen(true);
  };

  const handleSaveAthletes = async (): Promise<void> => {
    if (!selectedTeam) return;
    await fetch(`/api/teams/${selectedTeam.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({athleteIds: Array.from(selectedAthletes.ids).map((id) => Number(id))})
    });
    setAthletesDialogOpen(false);
    setSelectedTeam(null);
    const data = await fetch('/api/teams').then(res => res.json());
    setTeams(data);
  };

  const getFederativeAge = (birthdate: string): number => {
    const endOfYear = dayjs().endOf('year'); // 31 de dezembro do ano atual
    return endOfYear.diff(dayjs(birthdate), 'year');
  };

  // Columns Teams
  const teamColumns: GridColDef<TeamInterface>[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', width: 120 },
    {
      field: 'echelon',
      headerName: 'Echelon',
      flex: 1,
      valueGetter: (_value: EchelonInterface) =>
        _value.name ?? '-',
    },
    {
      field: 'athletes',
      headerName: 'Athletes',
      width: 120,
      valueGetter: (_value: AthleteInterface[]) =>
        _value.length ?? 0,
    },
    {
      field: 'actions',
      headerName: 'Actions',
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
    { field: 'name', headerName: 'Name', flex: 1 },
    {
      field: 'birthdate',
      headerName: 'Birthdate',
      flex: 1,
      valueFormatter: (_value) =>
        dayjs(_value as string).format('YYYY-MM-DD'),
    },
    {
      field: 'age',
      headerName: 'Age',
      width: 100,
      valueGetter: (_value, row: AthleteInterface) =>
        dayjs().diff(dayjs(row.birthdate), 'year'),
    },
  ];

  return (
    <Box>
      {/* Header with Add Button */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Teams Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Team
        </Button>
      </Box>

      {/* Teams DataGrid */}
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={teams}
          columns={teamColumns}
          getRowId={(row) => row.id}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
        />
      </Box>

      {/* Add/Edit Team Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingTeam ? 'Edit Team' : 'Add Team'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={formTeam.name ?? ''}
            onChange={(e) => setFormTeam({ ...formTeam, name: e.target.value })}
            fullWidth margin="normal"
          />
          <Select
            fullWidth value={formTeam.type ?? 'OTHER'}
            onChange={(e) => setFormTeam({ ...formTeam, type: e.target.value as string })}
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="OTHER">Other</MenuItem>
          </Select>
          <Select
            fullWidth value={formTeam.echelonId ?? 0}
            onChange={(e) => setFormTeam({ ...formTeam, echelonId: Number(e.target.value) })}
          >
            {echelons.map(e => (
              <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Athletes Manager Dialog */}
      <Dialog open={athletesDialogOpen} onClose={() => setAthletesDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Manage Athletes {selectedTeam ? `for ${selectedTeam.name}` : ''}</DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400 }}>
            <DataGrid
              rows={(athletes ?? [])
                .map(a => ({
                  ...a,
                  age: getFederativeAge(a.birthdate),
                }))
                .filter(a => {
                  const echelon = selectedTeam?.echelon;
                  if (!echelon) return true;

                  const minAge = echelon.minAge ?? 0;       // fallback seguro
                  const maxAge = echelon.maxAge ?? 100;     // fallback seguro

                  return a.age >= minAge && a.age <= maxAge;
                })}
              columns={athleteColumns}
              checkboxSelection
              getRowId={(row) => row.id}
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
          <Button onClick={() => setAthletesDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAthletes}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
