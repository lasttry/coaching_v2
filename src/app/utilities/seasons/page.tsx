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
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptPT } from '@mui/x-data-grid/locales';
import { useTranslation } from 'react-i18next';
import type { SeasonInterface } from '@/types/season/types';

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
        const msg = (data as { error?: string }).error ?? t('season.load.error');
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      setSeasons(data as SeasonInterface[]);
    } catch {
      setErrorMessage(t('season.load.networkError'));
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
      setErrorMessage(t('season.form.requiredFields'));
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
        const msg = (data as { error?: string }).error ?? t('season.create.error');
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage(t('season.create.success'));
      setNewSeason(defaultNewSeason());
      setOpenAddDialog(false);
      void fetchSeasons();
    } catch {
      setErrorMessage(t('season.create.networkError'));
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
        const msg = (data as { error?: string }).error ?? t('season.delete.error');
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage(t('season.delete.success'));
      void fetchSeasons();
    } catch {
      setErrorMessage(t('season.delete.networkError'));
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
        const msg = (data as { error?: string }).error ?? t('season.setCurrent.error');
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage(t('season.setCurrent.success'));
      void fetchSeasons();
    } catch {
      setErrorMessage(t('season.setCurrent.networkError'));
    }
  };

  const columns: GridColDef<SeasonInterface>[] = [
    {
      field: 'name',
      headerName: t('common.name'),
      flex: 1,
    },
    {
      field: 'startDate',
      headerName: t('common.start'),
      flex: 1,
      valueFormatter: (value: string) => (typeof value === 'string' ? value.slice(0, 10) : ''),
    },
    {
      field: 'endDate',
      headerName: t('common.end'),
      flex: 1,
      valueFormatter: (value: string) => (typeof value === 'string' ? value.slice(0, 10) : ''),
    },
    {
      field: 'isCurrent',
      headerName: t('common.current'),
      flex: 0.5,
      renderCell: (params) =>
        params.row.isCurrent ? <Chip label={t('common.current')} color="success" /> : <></>,
    },
    {
      field: 'actions',
      headerName: t('common.actions'),
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <>
          {!params.row.isCurrent && (
            <Tooltip title={t('season.makeCurrent')}>
              <IconButton color="primary" onClick={() => handleSetCurrent(params.row.id ?? 0)}>
                <StarIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('actions.delete')}>
            <IconButton color="error" onClick={() => setDeleteConfirmId(params.row.id ?? 0)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ height: 700, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          {t('season.management')}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
          {t('season.add')}
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
        localeText={ptPT.components.MuiDataGrid.defaultProps.localeText}
      />

      {/* Add Season Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('season.add')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('season.name')}
            placeholder="2025/2026"
            fullWidth
            size="small"
            value={newSeason.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
          />
          <TextField
            label={t('season.start')}
            type="date"
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            value={newSeason.startDate}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
          />
          <TextField
            label={t('season.end')}
            type="date"
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
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
            label={t('season.markAsCurrent')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>{t('actions.cancel')}</Button>
          <Button onClick={() => void handleAddSeason()} variant="contained" color="primary">
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('season.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('season.deleteConfirmationMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('actions.cancel')}</Button>
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
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeasonsPage;
