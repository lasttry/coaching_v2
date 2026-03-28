'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Paper,
  Grid,
  TextField,
  MenuItem,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { SizeEnum } from '@/types/game/types';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';
import { AthleteInterface } from '@/types/athlete/type';
import { AthletePreferredNumberInterface } from '@/types/athletePreferredNumber/type';

const buildEmptyAthlete = (): AthleteInterface => ({
  id: null,
  number: '',
  name: '',
  birthdate: '',
  fpbNumber: null,
  active: true,
  shirtSize: SizeEnum.S,
  // opcional no tipo, mas garantimos array para não dar undefined
  preferredNumbers: [],
});

const AthletesPage: React.FC = () => {
  const { t } = useTranslation();

  const [athletes, setAthletes] = useState<AthleteInterface[]>([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteInterface>(buildEmptyAthlete());

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const validateField = (
    field: keyof AthleteInterface,
    value: string | number | boolean | null | AthletePreferredNumberInterface[] | undefined
  ): string => {
    setErrorMessage('');
    setSuccessMessage('');

    switch (field) {
      case 'name':
        if (typeof value !== 'string') return t('NameIsInvalid');
        if (!value) return t('NameIsRequired');
        if (value.length > 50) return t('NameTooLong');
        break;
      case 'number':
        if (!value) return t('NumberIsRequired');
        break;
      case 'birthdate':
        if (!value) return t('BirthdateIsRequired');
        break;
      default:
        break;
    }
    return '';
  };

  const validateAll = (): boolean => {
    const fieldErrors: Record<string, string> = {};
    (['name', 'number', 'birthdate'] as (keyof AthleteInterface)[]).forEach((field) => {
      const err = validateField(field, selectedAthlete[field]);
      if (err) fieldErrors[field] = err;
    });
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleFieldChange =
    (field: keyof AthleteInterface) =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const rawValue = e.target.value;
      const value = field === 'fpbNumber' ? (rawValue ? Number(rawValue) : null) : rawValue;

      setSelectedAthlete((prev) => ({
        ...prev,
        [field]: value,
      }));

      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: validateField(field, value as string | number | boolean | null | undefined),
      }));
    };

  const handleSizeChange = (event: SelectChangeEvent<SizeEnum>, _child: React.ReactNode): void => {
    const value = event.target.value as SizeEnum;
    setSelectedAthlete((prev) => ({
      ...prev,
      shirtSize: value,
    }));
  };

  const handlePreferredNumberChange = (index: number, value: string): void => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;

    setSelectedAthlete((prev) => {
      const current = prev.preferredNumbers ?? [];
      const updated = current.map((p, i) =>
        i === index
          ? {
              ...p,
              number: numericValue,
            }
          : p
      );
      return { ...prev, preferredNumbers: updated };
    });
  };

  const handleAddPreferredNumber = (): void => {
    setSelectedAthlete((prev) => {
      const current = prev.preferredNumbers ?? [];
      const nextPreference =
        current.length === 0 ? 1 : Math.max(...current.map((p) => p.preference ?? 0)) + 1;

      const newPreferred: AthletePreferredNumberInterface = {
        id: 0,
        athleteId: prev.id ?? 0,
        number: 0,
        preference: nextPreference,
      };

      return {
        ...prev,
        preferredNumbers: [...current, newPreferred],
      };
    });
  };

  const handleRemovePreferredNumber = (index: number): void => {
    setSelectedAthlete((prev) => {
      const current = prev.preferredNumbers ?? [];
      const updated = current.filter((_, i) => i !== index);
      return { ...prev, preferredNumbers: updated };
    });
  };

  const handleDragStart = (index: number) => (): void => {
    setDragIndex(index);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const handleDrop =
    (index: number) =>
    (event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      if (dragIndex === null || dragIndex === index) return;

      setSelectedAthlete((prev) => {
        const current = prev.preferredNumbers ?? [];
        if (dragIndex < 0 || dragIndex >= current.length) return prev;

        const reordered = [...current];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(index, 0, moved);

        const withPreferences = reordered.map((p, i) => ({
          ...p,
          preference: i + 1,
        }));

        return { ...prev, preferredNumbers: withPreferences };
      });

      setDragIndex(null);
    };

  const handleResetForm = (): void => {
    setSelectedAthlete(buildEmptyAthlete());
    setErrors({});
  };

  const handleSaveFromForm = (): void => {
    if (!validateAll()) return;
    void handleSaveAthlete(selectedAthlete);
  };

  const fetchAthletes = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/athletes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch athletes');
      }

      setAthletes(data as AthleteInterface[]);
    } catch (err) {
      log.error('Error fetching athletes:', err);
      setErrorMessage(t('failedFetchAthlete'));
    } finally {
      setLoading(false);
    }
  }, [t, setErrorMessage]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchAthletes();
    }
  }, [fetchAthletes]);

  const handleOpenNewAthleteDialog = (): void => {
    setSelectedAthlete(buildEmptyAthlete());
    setOpenDialog(true);
  };

  const handleOpenEditAthleteDialog = (athlete: AthleteInterface): void => {
    setSelectedAthlete({
      ...athlete,
      preferredNumbers: athlete.preferredNumbers ?? [],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = (): void => {
    setOpenDialog(false);
  };

  const handleSaveAthlete = async (athlete: AthleteInterface): Promise<void> => {
    try {
      const hasId = !!athlete.id;
      const method = hasId ? 'PUT' : 'POST';
      const url = hasId ? `/api/athletes/${athlete.id}` : '/api/athletes';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(athlete),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save athlete');
      }

      setSuccessMessage(hasId ? t('saveSuccess') : t('addAthleteSuccess'));
      setOpenDialog(false);
      fetchAthletes();
    } catch (err) {
      log.error('Error saving athlete:', err);
      setErrorMessage(t('saveError'));
    }
  };

  const handleDeleteAthlete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/athletes/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || t('deleteError'));
      }

      setAthletes((prev) => prev.filter((a) => a.id !== id));
      setSuccessMessage(t('deleteSuccess'));
    } catch (err) {
      log.error('Error deleting athlete:', err);
      setErrorMessage(t('deleteError'));
    }
  };

  const columns: GridColDef<AthleteInterface>[] = [
    { field: 'number', headerName: t('number'), flex: 0.7, minWidth: 80 },
    { field: 'name', headerName: t('name'), flex: 2, minWidth: 180 },
    {
      field: 'birthdate',
      headerName: t('birthdate'),
      flex: 1,
      minWidth: 120,
      valueFormatter: (_value, row) =>
        row.birthdate ? dayjs(row.birthdate).format('YYYY-MM-DD') : '-',
    },
    { field: 'fpbNumber', headerName: t('fpbNumber'), flex: 1, minWidth: 110 },
    { field: 'shirtSize', headerName: t('shirtSize'), flex: 0.7, minWidth: 80 },
    {
      field: 'active',
      headerName: t('active'),
      flex: 0.7,
      minWidth: 80,
      valueFormatter: (_value, row) => (row.active ? t('yes') : t('no')),
    },
    {
      field: 'actions',
      headerName: t('actions'),
      flex: 1,
      minWidth: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Button
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
            onClick={() => handleOpenEditAthleteDialog(params.row)}
          >
            {t('edit')}
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={() => params.row.id !== undefined && setDeleteConfirmId(params.row.id)}
          >
            {t('delete')}
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header / toolbar */}
      <Box
        mb={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography variant="h4">{t('athletesManagement')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('athletesManagementSubtitle')}
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={fetchAthletes} disabled={loading}>
            {t('refresh')}
          </Button>
          <Button variant="contained" onClick={handleOpenNewAthleteDialog}>
            {t('addAthlete')}
          </Button>
        </Box>
      </Box>

      {/* Messages */}
      {successMessage && (
        <Box mb={2}>
          <Alert severity="success">{successMessage}</Alert>
        </Box>
      )}
      {errorMessage && (
        <Box mb={2}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}

      {/* Tabela */}
      <Paper elevation={1}>
        <Box sx={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={athletes}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id!}
            pageSizeOptions={[5, 10, 20]}
            pagination
            disableRowSelectionOnClick
            autoHeight={false}
          />
        </Box>
      </Paper>

      {/* Dialog Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedAthlete?.id ? t('editAthlete') : t('addNewAthlete')}</DialogTitle>
        <DialogContent>
          {selectedAthlete && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label={t('number')}
                    fullWidth
                    value={selectedAthlete.number ?? ''}
                    onChange={handleFieldChange('number')}
                    error={!!errors.number}
                    helperText={errors.number}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label={t('name')}
                    fullWidth
                    value={selectedAthlete.name}
                    onChange={handleFieldChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label={t('birthdate')}
                    type="date"
                    fullWidth
                    value={selectedAthlete.birthdate}
                    onChange={handleFieldChange('birthdate')}
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.birthdate}
                    helperText={errors.birthdate}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label={t('fpbNumber')}
                    fullWidth
                    type="number"
                    value={selectedAthlete.fpbNumber ?? ''}
                    onChange={handleFieldChange('fpbNumber')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Select
                    value={selectedAthlete.shirtSize ?? ''}
                    onChange={handleSizeChange}
                    fullWidth
                    displayEmpty
                  >
                    <MenuItem value="">{t('selectSize')}</MenuItem>
                    {Object.values(SizeEnum).map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                {/* Preferred numbers with drag-and-drop ordering */}
                <Grid size={{ xs: 12 }}>
                  <Grid container spacing={1} alignItems="center">
                    <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>
                      <strong>{t('preferredNumbers')}</strong>
                    </Grid>

                    {(selectedAthlete.preferredNumbers ?? []).map((p, index) => (
                      <Grid
                        key={`${p.id}-${index}`}
                        container
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 0.5, cursor: 'grab' }}
                        draggable
                        onDragStart={handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop(index)}
                      >
                        <Grid size={{ xs: 2, sm: 1 }}>
                          <span>{index + 1}.</span>
                        </Grid>
                        <Grid size={{ xs: 7, sm: 4 }}>
                          <TextField
                            label={t('preferredNumber')}
                            type="number"
                            fullWidth
                            size="small"
                            value={p.number ?? ''}
                            onChange={(e) => handlePreferredNumberChange(index, e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 3, sm: 2 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleRemovePreferredNumber(index)}
                          >
                            {t('remove')}
                          </Button>
                        </Grid>
                      </Grid>
                    ))}

                    <Grid
                      size={{ xs: 12 }}
                      sx={{ mt: 1, display: 'flex', justifyContent: 'flex-start' }}
                    >
                      <Button variant="outlined" onClick={handleAddPreferredNumber}>
                        {t('addPreferredNumber')}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              handleCloseDialog();
              handleResetForm();
            }}
          >
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={handleSaveFromForm}>
            {selectedAthlete?.id ? t('save') : t('add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de delete */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('deleteConfirmationMessage')}
            <br />
            <strong>{athletes.find((a) => a.id === deleteConfirmId)?.name}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteConfirmId !== null) {
                handleDeleteAthlete(deleteConfirmId);
              }
              setDeleteConfirmId(null);
            }}
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AthletesPage;
