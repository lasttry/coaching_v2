'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Alert,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import type { SeasonInterface } from '@/types/season/type';

interface NewSeasonState {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
}

const defaultNewSeason = (): NewSeasonState => ({
  name: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
});

const SeasonsPage: React.FC = () => {
  const { t } = useTranslation();

  const [seasons, setSeasons] = useState<SeasonInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [newSeason, setNewSeason] = useState<NewSeasonState>(defaultNewSeason);

  const fetchSeasons = async (): Promise<void> => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/seasons', { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) {
        const msg = (data as { error?: string }).error ?? t('loadSeasonsError');
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      setSeasons(data as SeasonInterface[]);
    } catch {
      setErrorMessage(t('loadSeasonsNetworkError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSeasons();
  }, []);

  const toIsoDate = (date: string, endOfDay = false): string => {
    if (!date) return '';
    return endOfDay ? `${date}T23:59:59.000Z` : `${date}T00:00:00.000Z`;
  };

  const handleFieldChange = (field: keyof NewSeasonState, value: string | boolean): void => {
    setNewSeason((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSeason = async (): Promise<void> => {
    if (!newSeason.name.trim() || !newSeason.startDate || !newSeason.endDate) {
      setErrorMessage(t('seasonFormRequiredFields'));
      return;
    }

    setErrorMessage(null);

    try {
      const res = await fetch('/api/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSeason.name.trim(),
          startDate: toIsoDate(newSeason.startDate, false),
          endDate: toIsoDate(newSeason.endDate, true),
          isCurrent: newSeason.isCurrent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = (data as { error?: string }).error ?? t('createSeasonError');
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage(t('createSeasonSuccess'));
      setNewSeason(defaultNewSeason());
      setOpenAddDialog(false);
      void fetchSeasons();
    } catch {
      setErrorMessage(t('createSeasonNetworkError'));
    }
  };

  const handleDeleteSeason = async (id: number): Promise<void> => {
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/seasons/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !(data as { success?: boolean }).success) {
        const msg = (data as { error?: string }).error ?? t('deleteSeasonError');
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage(t('deleteSeasonSuccess'));
      void fetchSeasons();
    } catch {
      setErrorMessage(t('deleteSeasonNetworkError'));
    }
  };

  const handleSetCurrent = async (id: number): Promise<void> => {
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/seasons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCurrent: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = (data as { error?: string }).error ?? t('setCurrentSeasonError');
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage(t('setCurrentSeasonSuccess'));
      void fetchSeasons();
    } catch {
      setErrorMessage(t('setCurrentSeasonNetworkError'));
    }
  };

  const columns: GridColDef<SeasonInterface>[] = [
    {
      field: 'name',
      headerName: t('name'),
      flex: 1,
    },
    {
      field: 'startDate',
      headerName: t('start'),
      flex: 1,
      valueFormatter: (value: string) => (typeof value === 'string' ? value.slice(0, 10) : ''),
    },
    {
      field: 'endDate',
      headerName: t('end'),
      flex: 1,
      valueFormatter: (value: string) => (typeof value === 'string' ? value.slice(0, 10) : ''),
    },
    {
      field: 'isCurrent',
      headerName: t('current'),
      flex: 0.5,
      renderCell: (params) =>
        params.row.isCurrent ? <Chip label={t('current')} color="success" /> : <></>,
    },
    {
      field: 'actions',
      headerName: t('actions'),
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!params.row.isCurrent && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSetCurrent(params.row.id ?? 0)}
            >
              {t('makeCurrent')}
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setDeleteConfirmId(params.row.id ?? 0)}
          >
            {t('Delete')}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ height: 700, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          {t('seasonsManagement')}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
          {t('addSeason')}
        </Button>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <DataGrid
        rows={seasons}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id ?? 0}
        pageSizeOptions={[5, 10, 20]}
        pagination
        disableRowSelectionOnClick
      />

      {/* Add Season Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('addSeason')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('seasonName')}
            placeholder="2025/2026"
            fullWidth
            size="small"
            value={newSeason.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
          />
          <TextField
            label={t('seasonStart')}
            type="date"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={newSeason.startDate}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
          />
          <TextField
            label={t('seasonEnd')}
            type="date"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={newSeason.endDate}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={newSeason.isCurrent}
                onChange={(e) => handleFieldChange('isCurrent', e.target.checked)}
              />
            }
            label={t('markSeasonAsCurrent')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>{t('cancel')}</Button>
          <Button onClick={() => void handleAddSeason()} variant="contained" color="primary">
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('confirmDeleteSeason')}</DialogTitle>
        <DialogContent>
          <Typography>{t('deleteSeasonConfirmationMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteConfirmId !== null) {
                void handleDeleteSeason(deleteConfirmId);
                setDeleteConfirmId(null);
              }
            }}
            color="error"
            variant="contained"
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeasonsPage;
