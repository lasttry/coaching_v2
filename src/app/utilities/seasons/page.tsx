'use client';

import React, { useState } from 'react';
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
import '@/lib/i18n.client';
import type { SeasonInterface } from '@/types/season/types';
import {
  useCreateSeason,
  useDeleteSeason,
  useSeasons,
  useSetCurrentSeason,
} from '@/hooks/useSeasons';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

interface NewSeasonState {
  name: string;
  startDate: string;
  endDate: string;
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

  const { data: seasons = [], isFetching, error: fetchError } = useSeasons();
  const createMutation = useCreateSeason();
  const deleteMutation = useDeleteSeason();
  const setCurrentMutation = useSetCurrentSeason();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [newSeason, setNewSeason] = useState<NewSeasonState>(defaultNewSeason);

  const isAddDirty = useFormSnapshotDirty(openAddDialog, newSeason);

  const toIsoDate = (date: string, endOfDay = false): string => {
    if (!date) return '';
    return endOfDay ? `${date}T23:59:59.000Z` : `${date}T00:00:00.000Z`;
  };

  const handleFieldChange = (field: keyof NewSeasonState, value: string | boolean): void => {
    setNewSeason((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSeason = (): void => {
    if (!newSeason.name.trim() || !newSeason.startDate || !newSeason.endDate) {
      setErrorMessage(t('season.form.requiredFields'));
      return;
    }
    setErrorMessage(null);
    createMutation.mutate(
      {
        name: newSeason.name.trim(),
        startDate: toIsoDate(newSeason.startDate, false),
        endDate: toIsoDate(newSeason.endDate, true),
        isCurrent: newSeason.isCurrent,
      },
      {
        onSuccess: () => {
          setSuccessMessage(t('season.create.success'));
          setNewSeason(defaultNewSeason());
          setOpenAddDialog(false);
        },
        onError: (err) => {
          setErrorMessage(err instanceof Error ? err.message : t('season.create.error'));
        },
      }
    );
  };

  const handleDeleteSeason = (id: number): void => {
    setErrorMessage(null);
    deleteMutation.mutate(id, {
      onSuccess: () => setSuccessMessage(t('season.delete.success')),
      onError: (err) =>
        setErrorMessage(err instanceof Error ? err.message : t('season.delete.error')),
    });
  };

  const handleSetCurrent = (id: number): void => {
    setErrorMessage(null);
    setCurrentMutation.mutate(id, {
      onSuccess: () => setSuccessMessage(t('season.setCurrent.success')),
      onError: (err) =>
        setErrorMessage(err instanceof Error ? err.message : t('season.setCurrent.error')),
    });
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

  const combinedError = errorMessage || (fetchError instanceof Error ? fetchError.message : null);

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

      {combinedError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
          {combinedError}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <DataGrid
        rows={seasons}
        columns={columns}
        loading={isFetching}
        getRowId={(row) => row.id ?? 0}
        pageSizeOptions={[5, 10, 20]}
        pagination
        disableRowSelectionOnClick
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        localeText={ptPT.components.MuiDataGrid.defaultProps.localeText}
      />

      <GuardedDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        isDirty={isAddDirty}
        maxWidth="sm"
        fullWidth
      >
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
          <Button onClick={() => setOpenAddDialog(false)} disabled={createMutation.isPending}>
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={handleAddSeason}
            variant="contained"
            color="primary"
            disabled={createMutation.isPending}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

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
                handleDeleteSeason(deleteConfirmId);
                setDeleteConfirmId(null);
              }
            }}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeasonsPage;
