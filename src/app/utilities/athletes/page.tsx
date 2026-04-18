'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
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
  Chip,
  Divider,
  Avatar,
  IconButton,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { IconUpload, IconTrash } from '@tabler/icons-react';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { Size } from '@prisma/client';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';
import { AthleteInterface } from '@/types/athlete/types';
import { AthletePreferredNumberInterface } from '@/types/athletePreferredNumber/types';

const buildEmptyAthlete = (): AthleteInterface => ({
  id: null,
  number: '',
  name: '',
  birthdate: '',
  fpbNumber: null,
  active: true,
  shirtSize: Size.S,
  photo: null,
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
  const [equipmentColors, setEquipmentColors] = useState<{ color: string; colorHex: string }[]>([]);
  const [newPrefColor, setNewPrefColor] = useState<string>('');
  const [newPrefNumber, setNewPrefNumber] = useState<string>('');

  const validateField = (
    field: keyof AthleteInterface,
    value: string | number | boolean | null | AthletePreferredNumberInterface[] | undefined
  ): string => {
    setErrorMessage('');
    setSuccessMessage('');

    switch (field) {
      case 'name':
        if (typeof value !== 'string') return t('validation.nameInvalid');
        if (!value) return t('validation.nameRequired');
        if (value.length > 50) return t('validation.nameMaxLength');
        break;
      case 'number':
        if (!value) return t('validation.numberRequired');
        break;
      case 'birthdate':
        if (!value) return t('athlete.validation.birthdateRequired');
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

  const handleSizeChange = (event: SelectChangeEvent<Size>, _child: React.ReactNode): void => {
    const value = event.target.value as Size;
    setSelectedAthlete((prev) => ({
      ...prev,
      shirtSize: value,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAthlete((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = (): void => {
    setSelectedAthlete((prev) => ({ ...prev, photo: null }));
  };

  const handlePreferredNumberChange = (color: string, value: string): void => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;

    setSelectedAthlete((prev) => {
      const current = prev.preferredNumbers ?? [];
      const existingIndex = current.findIndex((p) => p.color === color);

      if (existingIndex >= 0) {
        const updated = current.map((p) =>
          p.color === color ? { ...p, number: numericValue } : p
        );
        return { ...prev, preferredNumbers: updated };
      } else {
        return {
          ...prev,
          preferredNumbers: [...current, { color, number: numericValue }],
        };
      }
    });
  };

  const handleRemovePreferredNumber = (color: string): void => {
    setSelectedAthlete((prev) => {
      const current = prev.preferredNumbers ?? [];
      const updated = current.filter((p) => p.color !== color);
      return { ...prev, preferredNumbers: updated };
    });
  };

  const getPreferredNumberForColor = (color: string): number | '' => {
    const pref = selectedAthlete.preferredNumbers?.find((p) => p.color === color);
    return pref?.number ?? '';
  };

  const getAvailableColorsForNewPref = (): { color: string; colorHex: string }[] => {
    const usedColors = new Set(selectedAthlete.preferredNumbers?.map((p) => p.color) ?? []);
    return equipmentColors.filter((c) => !usedColors.has(c.color));
  };

  const getColorHex = (colorName: string): string => {
    return equipmentColors.find((c) => c.color === colorName)?.colorHex || '#ccc';
  };

  const handleAddNewPreferredNumber = (): void => {
    if (!newPrefColor || !newPrefNumber) return;
    const num = Number(newPrefNumber);
    if (Number.isNaN(num) || num <= 0) return;
    setSelectedAthlete((prev) => ({
      ...prev,
      preferredNumbers: [...(prev.preferredNumbers ?? []), { color: newPrefColor, number: num }],
    }));
    setNewPrefColor('');
    setNewPrefNumber('');
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
      setErrorMessage(t('athlete.fetch.singleError'));
    } finally {
      setLoading(false);
    }
  }, [t, setErrorMessage]);

  const fetchEquipmentColors = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/equipments/colors');
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setEquipmentColors(data);
      }
    } catch (err) {
      log.error('Error fetching equipment colors:', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchAthletes();
      fetchEquipmentColors();
    }
  }, [fetchAthletes, fetchEquipmentColors]);

  const handleOpenNewAthleteDialog = (): void => {
    setSelectedAthlete(buildEmptyAthlete());
    setOpenDialog(true);
  };

  const handleOpenEditAthleteDialog = (athlete: AthleteInterface): void => {
    const birthdateFormatted = athlete.birthdate
      ? new Date(athlete.birthdate).toISOString().split('T')[0]
      : '';
    setSelectedAthlete({
      ...athlete,
      birthdate: birthdateFormatted,
      photo: athlete.photo ?? null,
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

      setSuccessMessage(hasId ? t('messages.saveSuccess') : t('athlete.save.success'));
      setOpenDialog(false);
      fetchAthletes();
    } catch (err) {
      log.error('Error saving athlete:', err);
      setErrorMessage(t('messages.saveError'));
    }
  };

  const handleDeleteAthlete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/athletes/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || t('messages.deleteError'));
      }

      setAthletes((prev) => prev.filter((a) => a.id !== id));
      setSuccessMessage(t('messages.deleteSuccess'));
    } catch (err) {
      log.error('Error deleting athlete:', err);
      setErrorMessage(t('messages.deleteError'));
    }
  };

  const athletesGroupedByYear = useMemo(() => {
    const grouped: Record<string, AthleteInterface[]> = {};

    athletes.forEach((athlete) => {
      const year = athlete.birthdate
        ? dayjs(athlete.birthdate).format('YYYY')
        : t('common.unknown');
      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(athlete);
    });

    Object.keys(grouped).forEach((year) => {
      grouped[year].sort((a, b) => a.name.localeCompare(b.name, 'pt'));
    });

    const sortedYears = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    return sortedYears.map((year) => ({
      year,
      athletes: grouped[year],
    }));
  }, [athletes, t]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header / toolbar */}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4">{t('athlete.management')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('athlete.managementSubtitle')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={fetchAthletes} disabled={loading}>
            {t('actions.refresh')}
          </Button>
          <Button variant="contained" onClick={handleOpenNewAthleteDialog}>
            {t('athlete.add')}
          </Button>
        </Box>
      </Box>

      {/* Messages */}
      {successMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="success">{successMessage}</Alert>
        </Box>
      )}
      {errorMessage && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{errorMessage}</Alert>
        </Box>
      )}

      {/* Lista agrupada por ano */}
      <Paper elevation={1} sx={{ p: 2 }}>
        {loading && <Typography color="text.secondary">{t('common.loading')}</Typography>}

        {!loading && athletes.length === 0 && (
          <Typography color="text.secondary">{t('athlete.fetch.notFound')}</Typography>
        )}

        {!loading &&
          athletesGroupedByYear.map((group, groupIndex) => (
            <Box key={group.year}>
              {groupIndex > 0 && <Divider sx={{ my: 2 }} />}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Chip
                  label={group.year}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 'bold', mr: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  ({group.athletes.length}{' '}
                  {group.athletes.length === 1 ? t('athlete') : t('athlete.title').toLowerCase()})
                </Typography>
              </Box>

              {group.athletes.map((athlete) => (
                <Box
                  key={athlete.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1,
                    px: 1.5,
                    mb: 0.5,
                    borderRadius: 1,
                    backgroundColor: athlete.active ? 'grey.50' : 'action.disabledBackground',
                    '&:hover': { backgroundColor: 'grey.100' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ minWidth: 35, fontWeight: 'bold', color: 'primary.main' }}
                    >
                      {athlete.number || '-'}
                    </Typography>
                    <Typography variant="body1" sx={{ minWidth: 180 }}>
                      {athlete.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
                      {athlete.birthdate ? dayjs(athlete.birthdate).format('DD/MM/YYYY') : '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                      {athlete.shirtSize || '-'}
                    </Typography>
                    {/* Preferred Numbers */}
                    <Box sx={{ display: 'flex', gap: 0.5, minWidth: 120 }}>
                      {(athlete.preferredNumbers ?? []).map((pref) => {
                        const colorHex =
                          equipmentColors.find((c) => c.color === pref.color)?.colorHex || '#ccc';
                        return (
                          <Box
                            key={pref.color}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              backgroundColor: colorHex,
                              border: '1px solid rgba(0,0,0,0.2)',
                            }}
                            title={pref.color}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 'bold',
                                color:
                                  colorHex.toLowerCase() === '#ffffff' ||
                                  colorHex.toLowerCase() === '#fff'
                                    ? '#000'
                                    : '#fff',
                                textShadow:
                                  colorHex.toLowerCase() === '#ffffff' ||
                                  colorHex.toLowerCase() === '#fff'
                                    ? 'none'
                                    : '0 0 2px rgba(0,0,0,0.5)',
                              }}
                            >
                              {pref.number}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                    {!athlete.active && (
                      <Chip label={t('common.inactive')} size="small" color="default" />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenEditAthleteDialog(athlete)}
                    >
                      {t('actions.edit')}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => athlete.id !== undefined && setDeleteConfirmId(athlete.id)}
                    >
                      {t('actions.delete')}
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
      </Paper>

      {/* Dialog Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedAthlete?.id ? t('athlete.edit') : t('athlete.addNew')}</DialogTitle>
        <DialogContent>
          {selectedAthlete && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {/* Photo Upload */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={selectedAthlete.photo || undefined}
                      sx={{ width: 60, height: 75, borderRadius: 1 }}
                      variant="rounded"
                    >
                      {selectedAthlete.name?.charAt(0) || '?'}
                    </Avatar>
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="athlete-photo-upload"
                        type="file"
                        onChange={handlePhotoUpload}
                      />
                      <label htmlFor="athlete-photo-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<IconUpload size={18} />}
                          size="small"
                        >
                          {t('images.upload')}
                        </Button>
                      </label>
                      {selectedAthlete.photo && (
                        <IconButton
                          color="error"
                          onClick={handleRemovePhoto}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label={t('common.number')}
                    fullWidth
                    value={selectedAthlete.number ?? ''}
                    onChange={handleFieldChange('number')}
                    error={!!errors.number}
                    helperText={errors.number}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    label={t('common.name')}
                    fullWidth
                    value={selectedAthlete.name}
                    onChange={handleFieldChange('name')}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <TextField
                    label={t('common.birthdate')}
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
                    label={t('fpb.number')}
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
                    <MenuItem value="">{t('equipment.size.select')}</MenuItem>
                    {Object.values(Size).map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                {/* Preferred numbers per equipment color */}
                {equipmentColors.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Grid container spacing={1} sx={{ alignItems: 'center' }}>
                      <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>
                        <strong>{t('equipment.preferredNumbers')}</strong>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({t('common.optional')})
                        </Typography>
                      </Grid>

                      {(selectedAthlete.preferredNumbers ?? []).map((pref) => (
                        <Box
                          key={pref.color}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mb: 1,
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: 'grey.50',
                          }}
                        >
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              backgroundColor: getColorHex(pref.color),
                              border: '1px solid #999',
                              borderRadius: 1,
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2" sx={{ minWidth: 80 }}>
                            {pref.color}
                          </Typography>
                          <Typography variant="body1" sx={{ minWidth: 50, fontWeight: 'bold' }}>
                            Nº {pref.number}
                          </Typography>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleRemovePreferredNumber(pref.color)}
                          >
                            {t('actions.remove')}
                          </Button>
                        </Box>
                      ))}

                      {getAvailableColorsForNewPref().length > 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Select
                            value={newPrefColor}
                            onChange={(e) => setNewPrefColor(e.target.value)}
                            size="small"
                            displayEmpty
                            sx={{ minWidth: 150 }}
                          >
                            <MenuItem value="">{t('equipment.color.select')}</MenuItem>
                            {getAvailableColorsForNewPref().map((c) => (
                              <MenuItem key={c.color} value={c.color}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      backgroundColor: c.colorHex,
                                      border: '1px solid #999',
                                      borderRadius: 1,
                                    }}
                                  />
                                  {c.color}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                          <TextField
                            label={t('common.number')}
                            type="number"
                            size="small"
                            value={newPrefNumber}
                            onChange={(e) => setNewPrefNumber(e.target.value)}
                            sx={{ width: 100 }}
                          />
                          <Button
                            variant="contained"
                            onClick={handleAddNewPreferredNumber}
                            disabled={!newPrefColor || !newPrefNumber}
                          >
                            {t('actions.add')}
                          </Button>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                )}
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
            {t('actions.cancel')}
          </Button>
          <Button variant="contained" onClick={handleSaveFromForm}>
            {selectedAthlete?.id ? t('actions.save') : t('actions.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação de delete */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('messages.confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('messages.deleteConfirmation')}
            <br />
            <strong>{athletes.find((a) => a.id === deleteConfirmId)?.name}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('actions.cancel')}</Button>
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
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AthletesPage;
