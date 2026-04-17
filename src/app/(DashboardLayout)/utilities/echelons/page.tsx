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
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptBR } from '@mui/x-data-grid/locales';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import { EchelonInterface } from '@/types/echelons/types';
import { Gender } from '@prisma/client';
import { log } from '@/lib/logger';

const initialEchelon: EchelonInterface = {
  id: null,
  name: '',
  description: '',
  minAge: null,
  maxAge: null,
  gender: null,
};

export default function EchelonsPage(): React.JSX.Element {
  const { t } = useTranslation();

  // State
  const [echelons, setEchelons] = useState<EchelonInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<Gender | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEchelon, setEditingEchelon] = useState<EchelonInterface | null>(null);
  const [formData, setFormData] = useState<EchelonInterface>(initialEchelon);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchEchelons = async (): Promise<void> => {
      try {
        const res = await fetch('/api/echelons');
        if (!res.ok) throw new Error('Failed to fetch echelons');
        const data = await res.json();
        setEchelons(data);
      } catch (err) {
        log.error('Error fetching echelons:', err);
        setErrorMessage(t('failedFetchEchelons'));
      } finally {
        setLoading(false);
      }
    };
    fetchEchelons();
  }, [t]);

  // Handlers
  const handleOpenDialog = useCallback((echelon?: EchelonInterface): void => {
    if (echelon) {
      setEditingEchelon(echelon);
      setFormData(echelon);
    } else {
      setEditingEchelon(null);
      setFormData(initialEchelon);
    }
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback((): void => {
    setDialogOpen(false);
    setEditingEchelon(null);
    setFormData(initialEchelon);
  }, []);

  const handleSave = async (): Promise<void> => {
    if (!formData.name?.trim() || !formData.minAge || !formData.gender) {
      setErrorMessage(t('missingFields'));
      return;
    }

    try {
      let res: Response;
      if (editingEchelon?.id) {
        res = await fetch(`/api/echelons/${editingEchelon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch('/api/echelons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) throw new Error(await res.text());
      const saved: EchelonInterface = await res.json();

      setEchelons((prev) => {
        const exists = prev.some((e) => e.id === saved.id);
        if (exists) {
          return prev.map((e) => (e.id === saved.id ? saved : e));
        }
        return [...prev, saved];
      });

      setSuccessMessage(
        t('echelonSuccess', { status: editingEchelon ? t('updated') : t('created') })
      );
      handleCloseDialog();
    } catch (err) {
      log.error('Error saving echelon:', err);
      setErrorMessage(t('echelonFailed', { status: editingEchelon ? t('update') : t('create') }));
    }
  };

  const confirmDelete = useCallback((id: number | null): void => {
    if (!id) return;
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }, []);

  // Filtered echelons based on gender filter
  const filteredEchelons = useMemo(() => {
    if (genderFilter === '') {
      return echelons;
    }
    return echelons.filter((e) => e.gender === genderFilter);
  }, [echelons, genderFilter]);

  const handleDelete = async (): Promise<void> => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/echelons/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());

      setEchelons((prev) => prev.filter((e) => e.id !== deleteId));
      setSuccessMessage(t('echelonSuccess', { status: t('deleted') }));
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    } catch (err) {
      log.error('Error deleting echelon:', err);
      setErrorMessage(t('echelonFailed', { status: t('delete') }));
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'name', headerName: t('name'), flex: 1 },
      { field: 'minAge', headerName: t('minAge'), width: 100 },
      { field: 'maxAge', headerName: t('maxAge'), width: 100 },
      {
        field: 'gender',
        headerName: t('gender'),
        width: 120,
        valueGetter: (value: string) => t(value || 'unknown'),
      },
      { field: 'description', headerName: t('description'), flex: 1 },
      {
        field: 'actions',
        headerName: t('actions'),
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <>
            <IconButton onClick={() => handleOpenDialog(params.row as EchelonInterface)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => confirmDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      },
    ],
    [t, handleOpenDialog, confirmDelete]
  );

  return (
    <Box>
      {/* Notifications */}
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
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{t('echelonsManagement')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          {t('addNewEchelon')}
        </Button>
      </Box>

      {/* Gender Filter */}
      <Box sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label={t('gender')}
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value as Gender | '')}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">{t('all')}</MenuItem>
          {Object.entries(Gender).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {t(key)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* DataGrid */}
      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredEchelons}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id!}
          pageSizeOptions={[5, 10, 25]}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'minAge', sort: 'asc' }] },
          }}
        />
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingEchelon ? t('updateEchelon') : t('createEchelon')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('minAge')}
                type="number"
                value={formData.minAge ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minAge: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                required
                fullWidth
              />
              <TextField
                label={t('maxAge')}
                type="number"
                value={formData.maxAge ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAge: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                fullWidth
              />
            </Box>
            <FormControl fullWidth required>
              <InputLabel>{t('gender')}</InputLabel>
              <Select
                value={formData.gender ?? ''}
                label={t('gender')}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
              >
                {Object.entries(Gender).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {t(key)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('description')}
              value={formData.description ?? ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('Cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('deleteConfirmationMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>{t('Cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
