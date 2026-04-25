'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Alert,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
};

const isLightHex = (hex: string): boolean => {
  const clean = hex.replace('#', '');
  if (clean.length !== 3 && clean.length !== 6) return false;
  const expanded =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(expanded.substring(0, 2), 16);
  const g = parseInt(expanded.substring(2, 4), 16);
  const b = parseInt(expanded.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.7;
};

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { Size } from '@prisma/client';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';
import {
  useAthletes,
  useEquipmentColors,
  useSaveAthlete,
  useDeleteAthlete,
} from '@/hooks/useAthletes';
import { AthleteInterface } from '@/types/athlete/types';
import { AthletePreferredNumberInterface } from '@/types/athletePreferredNumber/types';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

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

  const {
    data: athletes = [],
    isLoading: loading,
    isFetching: refetching,
    error: fetchError,
    refetch: refetchAthletes,
  } = useAthletes();
  const { data: equipmentColors = [] } = useEquipmentColors();
  const saveAthleteMutation = useSaveAthlete();
  const deleteAthleteMutation = useDeleteAthlete();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteInterface>(buildEmptyAthlete());

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newPrefColor, setNewPrefColor] = useState<string>('');
  const [newPrefNumber, setNewPrefNumber] = useState<string>('');

  // Pre-fill rules add a few preferred-number rows automatically when editing
  // an existing athlete; the snapshot guarantees those auto-additions are
  // ignored when computing dirtiness.
  const isAthleteFormDirty = useFormSnapshotDirty(openDialog, {
    selectedAthlete,
    newPrefColor,
    newPrefNumber,
  });

  useEffect(() => {
    if (fetchError) {
      log.error('Error fetching athletes:', fetchError);
      setErrorMessage(t('athlete.fetch.singleError'));
    }
  }, [fetchError, setErrorMessage, t]);

  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [expandedYear, setExpandedYear] = useState<string | false>(false);
  const [initialExpandDone, setInitialExpandDone] = useState(false);

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
    handleSaveAthlete(selectedAthlete);
  };

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

  const handleSaveAthlete = (athlete: AthleteInterface): void => {
    const hasId = !!athlete.id;
    saveAthleteMutation.mutate(athlete, {
      onSuccess: () => {
        setSuccessMessage(hasId ? t('messages.saveSuccess') : t('athlete.save.success'));
        setOpenDialog(false);
      },
      onError: (err) => {
        log.error('Error saving athlete:', err);
        setErrorMessage(t('messages.saveError'));
      },
    });
  };

  const handleDeleteAthlete = (id: number): void => {
    deleteAthleteMutation.mutate(id, {
      onSuccess: () => {
        setSuccessMessage(t('messages.deleteSuccess'));
      },
      onError: (err) => {
        log.error('Error deleting athlete:', err);
        setErrorMessage(t('messages.deleteError'));
      },
    });
  };

  const filteredAthletes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return athletes.filter((a) => {
      if (statusFilter === 'active' && !a.active) return false;
      if (statusFilter === 'inactive' && a.active) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        (a.number ?? '').toString().toLowerCase().includes(q) ||
        (a.fpbNumber ?? '').toString().toLowerCase().includes(q)
      );
    });
  }, [athletes, search, statusFilter]);

  const athletesGroupedByYear = useMemo(() => {
    const grouped: Record<string, AthleteInterface[]> = {};

    filteredAthletes.forEach((athlete) => {
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
  }, [filteredAthletes, t]);

  useEffect(() => {
    if (initialExpandDone) return;
    if (athletesGroupedByYear.length === 0) return;
    setExpandedYear(athletesGroupedByYear[0].year);
    setInitialExpandDone(true);
  }, [athletesGroupedByYear, initialExpandDone]);

  const getAgeFromBirthdate = (birthdate: string | null | undefined): number | null => {
    if (!birthdate) return null;
    const b = dayjs(birthdate);
    if (!b.isValid()) return null;
    return dayjs().diff(b, 'year');
  };

  const totalVisible = filteredAthletes.length;
  const totalActive = athletes.filter((a) => a.active).length;
  const totalInactive = athletes.length - totalActive;

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
          <Typography variant="h4" gutterBottom>
            {t('athlete.management')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('athlete.managementSubtitle')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => void refetchAthletes()}
            disabled={loading || refetching}
          >
            {t('actions.refresh')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNewAthleteDialog}>
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

      {/* Toolbar: search + status filter + counters */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <TextField
          size="small"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={statusFilter}
          onChange={(_, val) => val && setStatusFilter(val)}
        >
          <ToggleButton value="all">
            {t('common.all')} ({athletes.length})
          </ToggleButton>
          <ToggleButton value="active">
            {t('common.active')} ({totalActive})
          </ToggleButton>
          <ToggleButton value="inactive">
            {t('common.inactive')} ({totalInactive})
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {totalVisible} {t('athlete.title').toLowerCase()}
        </Typography>
      </Paper>

      {loading && <Typography color="text.secondary">{t('common.loading')}</Typography>}

      {!loading && athletesGroupedByYear.length === 0 && (
        <Typography color="text.secondary">{t('athlete.fetch.notFound')}</Typography>
      )}

      {!loading &&
        athletesGroupedByYear.map((group) => {
          const parsedYear = Number(group.year);
          const groupAge = Number.isFinite(parsedYear) ? dayjs().year() - parsedYear : null;
          return (
            <Accordion
              key={group.year}
              expanded={expandedYear === group.year}
              onChange={(_, isExpanded) => setExpandedYear(isExpanded ? group.year : false)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {group.year}
                  </Typography>
                  {groupAge !== null && group.year !== t('common.unknown') && (
                    <Typography variant="body2" color="text.secondary">
                      ({groupAge} {t('common.age').toLowerCase()})
                    </Typography>
                  )}
                  <Chip
                    label={`${group.athletes.length} ${group.athletes.length === 1 ? t('athlete.singular').toLowerCase() : t('athlete.title').toLowerCase()}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 72 }} />
                        <TableCell sx={{ width: 60 }}>{t('common.number')}</TableCell>
                        <TableCell>{t('common.name')}</TableCell>
                        <TableCell sx={{ width: 140 }}>{t('common.birthdate')}</TableCell>
                        <TableCell sx={{ width: 80 }} align="center">
                          {t('equipment.size.title')}
                        </TableCell>
                        <TableCell>{t('equipment.preferredNumbers')}</TableCell>
                        <TableCell sx={{ width: 100 }} align="center">
                          {t('common.status')}
                        </TableCell>
                        <TableCell sx={{ width: 110 }} align="right">
                          {t('common.actions')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.athletes.map((athlete) => (
                        <TableRow
                          key={athlete.id}
                          hover
                          sx={{
                            opacity: athlete.active ? 1 : 0.6,
                          }}
                        >
                          <TableCell>
                            <Avatar
                              src={athlete.photo || undefined}
                              variant="rounded"
                              sx={{
                                width: 44,
                                height: 52,
                                bgcolor: athlete.photo
                                  ? 'transparent'
                                  : stringToColor(athlete.name || ''),
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              {!athlete.photo && getInitials(athlete.name || '')}
                            </Avatar>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: 'primary.main' }}
                            >
                              {athlete.number || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {athlete.name}
                            </Typography>
                            {athlete.fpbNumber && (
                              <Typography variant="caption" color="text.secondary">
                                {t('fpb.number')}: {athlete.fpbNumber}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {athlete.birthdate
                                ? dayjs(athlete.birthdate).format('DD/MM/YYYY')
                                : '—'}
                            </Typography>
                            {athlete.birthdate && (
                              <Typography variant="caption" color="text.secondary">
                                {getAgeFromBirthdate(athlete.birthdate)}{' '}
                                {t('common.age').toLowerCase()}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={athlete.shirtSize || '—'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {(athlete.preferredNumbers ?? []).map((pref) => {
                                const colorHex =
                                  equipmentColors.find((c) => c.color === pref.color)?.colorHex ||
                                  '#ccc';
                                const light = isLightHex(colorHex);
                                return (
                                  <Tooltip key={pref.color} title={pref.color}>
                                    <Box
                                      sx={{
                                        minWidth: 34,
                                        height: 28,
                                        px: 1,
                                        borderRadius: 1,
                                        backgroundColor: colorHex,
                                        color: light ? '#000' : '#fff',
                                        border: '1px solid rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: 13,
                                      }}
                                    >
                                      {pref.number}
                                    </Box>
                                  </Tooltip>
                                );
                              })}
                              {(athlete.preferredNumbers ?? []).length === 0 && (
                                <Typography variant="caption" color="text.disabled">
                                  —
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={athlete.active ? t('common.active') : t('common.inactive')}
                              size="small"
                              color={athlete.active ? 'success' : 'default'}
                              variant={athlete.active ? 'filled' : 'outlined'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={t('actions.edit')}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEditAthleteDialog(athlete)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('actions.delete')}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  athlete.id !== undefined && setDeleteConfirmId(athlete.id)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })}

      {/* Dialog Add/Edit */}
      <GuardedDialog
        open={openDialog}
        onClose={handleCloseDialog}
        isDirty={isAthleteFormDirty}
        maxWidth="md"
        fullWidth
      >
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
      </GuardedDialog>

      {/* Dialog de confirmação de delete */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('messages.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('messages.deleteConfirmation')}
            <br />
            <strong>{athletes.find((a) => a.id === deleteConfirmId)?.name}</strong>
          </DialogContentText>
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
