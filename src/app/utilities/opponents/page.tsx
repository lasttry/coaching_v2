'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptPT } from '@mui/x-data-grid/locales';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { OpponentInterface } from '@/types/opponent/types';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

const initialOpponent: OpponentInterface = {
  name: '',
  shortName: '',
  fpbClubId: undefined,
  fpbTeamId: undefined,
  venues: [],
};

export default function OpponentManagement(): React.JSX.Element {
  const { t } = useTranslation();
  const [opponents, setOpponents] = useState<OpponentInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOpponent, setEditingOpponent] = useState<OpponentInterface | null>(null);
  const [formOpponent, setFormOpponent] = useState<OpponentInterface>(initialOpponent);
  const [newVenue, setNewVenue] = useState('');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpponents = async (): Promise<void> => {
      try {
        const res = await fetch('/api/opponents');
        if (!res.ok) {
          throw new Error('Failed to fetch opponents');
        }
        const data = await res.json();
        setOpponents(data);
      } catch (err) {
        log.error('Error fetching opponents:', err);
        setErrorMessage(t('opponent.fetch.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchOpponents();
  }, []);

  const handleSave = async (): Promise<void> => {
    if (!formOpponent.name.trim() || !formOpponent.shortName.trim()) {
      return;
    }

    try {
      let res: Response;

      if (editingOpponent && editingOpponent.id !== null) {
        // Update existing opponent
        res = await fetch(`/api/opponents/${editingOpponent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formOpponent),
        });
      } else {
        // Create new opponent
        res = await fetch('/api/opponents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formOpponent),
        });
      }

      if (!res.ok) throw new Error(await res.text());
      const saved: OpponentInterface = await res.json();

      setOpponents((prev) => {
        // If it has an id that already exists, update; otherwise, append
        if (saved.id !== null) {
          const exists = prev.some((o) => o.id === saved.id);
          if (exists) {
            return prev.map((o) => (o.id === saved.id ? saved : o));
          }
        }
        return [...prev, saved];
      });

      setDialogOpen(false);
      setFormOpponent(initialOpponent);
      setNewVenue('');
      setEditingOpponent(null);
    } catch (err) {
      log.error('Error saving opponent:', err);
      setErrorMessage(t('opponent.save.error'));
    }
  };

  const handleEdit = useCallback((opponent: OpponentInterface): void => {
    setEditingOpponent(opponent);
    setFormOpponent(opponent);
    setDialogOpen(true);
  }, []);

  const confirmDelete = useCallback((id?: number): void => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDelete = async (): Promise<void> => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/opponents/${deleteId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error(await res.text());

      // Remove from UI state
      setOpponents((prev) => prev.filter((o) => o.id !== deleteId));

      setDeleteConfirmOpen(false);
      setDeleteId(undefined);
    } catch (err) {
      log.error('Error deleting opponent:', err);
      setErrorMessage(t('opponent.delete.error'));
    }
  };

  // Define DataGrid columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'image',
        headerName: t('common.logo'),
        renderCell: (params) => <Avatar src={params.value as string} variant="rounded" />,
        width: 80,
        sortable: false,
      },
      { field: 'name', headerName: t('common.name'), flex: 1 },
      { field: 'shortName', headerName: t('common.shortName'), width: 120 },
      { field: 'fpbClubId', headerName: t('fpb.clubId'), flex: 1 },
      { field: 'fpbTeamId', headerName: t('fpb.teamId'), flex: 1 },
      {
        field: 'venues',
        headerName: t('venue.title'),
        flex: 2,
        renderCell: (params) => (
          <Box>
            {(params.value as { name: string }[] | undefined)?.map((v, i) => (
              <Chip key={i} label={v.name} size="small" sx={{ mr: 0.5 }} />
            ))}
          </Box>
        ),
        sortable: false,
      },
      {
        field: 'actions',
        headerName: t('common.actions'),
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
        filterable: false,
      },
    ],
    [handleEdit, confirmDelete, t]
  );

  return (
    <Box>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{t('opponent.management')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingOpponent(null);
            setFormOpponent(initialOpponent);
            setDialogOpen(true);
          }}
        >
          {t('opponent.add')}
        </Button>
      </Box>

      {/* DataGrid with pagination + sort */}
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={opponents}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id!}
          pageSizeOptions={[5, 10, 25]}
          localeText={ptPT.components.MuiDataGrid.defaultProps.localeText}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
        />
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingOpponent ? t('opponent.edit') : t('opponent.add')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Upload Image */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              {formOpponent.image ? (
                <>
                  <Avatar
                    src={formOpponent.image}
                    alt={formOpponent.name}
                    sx={{ width: 80, height: 80, mb: 1 }}
                    variant="rounded"
                  />
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => setFormOpponent({ ...formOpponent, image: undefined })}
                  >
                    {t('images.remove')}
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('images.notSelected')}
                  </Typography>
                  <Button variant="outlined" component="label">
                    {t('images.upload')}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          setFormOpponent({ ...formOpponent, image: base64 });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </Button>
                </>
              )}
            </Box>

            {/* Name and Short Name */}
            <TextField
              label={t('common.name')}
              value={formOpponent.name}
              onChange={(e) => setFormOpponent({ ...formOpponent, name: e.target.value })}
              required
            />
            <TextField
              label={t('common.shortName')}
              value={formOpponent.shortName}
              onChange={(e) => setFormOpponent({ ...formOpponent, shortName: e.target.value })}
              required
              slotProps={{ htmlInput: { maxLength: 6 } }}
            />

            <TextField
              label={t('fpb.clubId')}
              type="number"
              value={formOpponent.fpbClubId ?? ''}
              onChange={(e) =>
                setFormOpponent({
                  ...formOpponent,
                  fpbClubId: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <TextField
              label={t('fpb.teamId')}
              type="number"
              value={formOpponent.fpbTeamId ?? ''}
              onChange={(e) =>
                setFormOpponent({
                  ...formOpponent,
                  fpbTeamId: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              slotProps={{ htmlInput: { min: 0 } }}
            />

            {/* Venues */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField
                label={t('venue.add')}
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (!newVenue.trim()) return;
                  setFormOpponent({
                    ...formOpponent,
                    venues: [...(formOpponent.venues ?? []), { name: newVenue }],
                  });
                  setNewVenue('');
                }}
              >
                {t('actions.add')}
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
                      venues: (formOpponent.venues ?? []).filter((_, idx) => idx !== i),
                    })
                  }
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t('messages.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('messages.deleteConfirmation')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>{t('actions.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
