'use client';
import React, { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, IconButton, Stack, Chip, Avatar
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { OpponentInterface } from '@/types/games/types';

const initialOpponent: OpponentInterface = {
  name: '',
  shortName: '',
  venues: []
};

export default function OpponentManagement(): React.JSX.Element {
  const [opponents, setOpponents] = useState<OpponentInterface[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOpponent, setEditingOpponent] = useState<OpponentInterface | null>(null);
  const [formOpponent, setFormOpponent] = useState<OpponentInterface>(initialOpponent);
  const [newVenue, setNewVenue] = useState('');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);

  const fetchOpponents = async (): Promise<void> => {
    const res = await fetch('/api/opponents');
    const data = await res.json();
    setOpponents(data);
  };

  useEffect(() => {
    fetchOpponents();
  }, []);

  const handleSave = (): void => {
    if (!formOpponent.name.trim() || !formOpponent.shortName.trim()) return;

    if (editingOpponent) {
      setOpponents(prev =>
        prev.map(o => (o.id === editingOpponent.id ? { ...formOpponent } : o))
      );
    } else {
      setOpponents(prev => [...prev, { ...formOpponent, id: Date.now() }]);
    }

    setDialogOpen(false);
    setEditingOpponent(null);
    setFormOpponent(initialOpponent);
    setNewVenue('');
  };

  const handleEdit = (opponent: OpponentInterface): void => {
    setEditingOpponent(opponent);
    setFormOpponent(opponent);
    setDialogOpen(true);
  };

  const confirmDelete = (id?: number): void => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = (): void => {
    setOpponents(prev => prev.filter(o => o.id !== deleteId));
    setDeleteConfirmOpen(false);
    setDeleteId(undefined);
  };

  // Define DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'image',
      headerName: 'Logo',
      renderCell: (params) => (
        <Avatar src={params.value as string} variant="rounded" />
      ),
      width: 80,
      sortable: false
    },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'shortName', headerName: 'Short', width: 120 },
    {
      field: 'venues',
      headerName: 'Venues',
      flex: 2,
      renderCell: (params) => (
        <Box>
          {(params.value as { name: string }[] | undefined)?.map((v, i) => (
            <Chip key={i} label={v.name} size="small" sx={{ mr: 0.5 }} />
          ))}
        </Box>
      ),
      sortable: false
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleEdit(params.row as OpponentInterface)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => confirmDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
      sortable: false,
      filterable: false
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Opponent Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Opponent
        </Button>
      </Box>

      {/* DataGrid with pagination + sort */}
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={opponents}
          columns={columns}
          getRowId={(row) => row.id!} // needed because OpponentInterface uses id
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] }
          }}
        />
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingOpponent ? 'Edit Opponent' : 'Add Opponent'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={formOpponent.name}
              onChange={e => setFormOpponent({ ...formOpponent, name: e.target.value })}
              required
            />
            <TextField
              label="Short Name"
              value={formOpponent.shortName}
              onChange={e => setFormOpponent({ ...formOpponent, shortName: e.target.value })}
              required
              inputProps={{ maxLength: 6 }}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="Add Venue"
                value={newVenue}
                onChange={e => setNewVenue(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (!newVenue.trim()) return;
                  setFormOpponent({
                    ...formOpponent,
                    venues: [...(formOpponent.venues ?? []), { name: newVenue }]
                  });
                  setNewVenue('');
                }}
              >
                Add
              </Button>
            </Stack>
            <Box>
              {formOpponent.venues?.map((v, i) => (
                <Chip
                  key={i}
                  label={v.name}
                  onDelete={() =>
                    setFormOpponent({
                      ...formOpponent,
                      venues: formOpponent.venues!.filter((_, idx) => idx !== i)
                    })
                  }
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this opponent?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}