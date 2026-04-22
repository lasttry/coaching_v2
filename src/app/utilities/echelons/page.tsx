'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
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
  Paper,
  Chip,
  Tooltip,
  InputAdornment,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Wc as CoedIcon,
  Cake as CakeIcon,
} from '@mui/icons-material';
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

const genderIcon = (gender: Gender | null): React.JSX.Element => {
  if (gender === 'MALE') return <MaleIcon fontSize="small" sx={{ color: '#1976d2' }} />;
  if (gender === 'FEMALE') return <FemaleIcon fontSize="small" sx={{ color: '#d81b60' }} />;
  if (gender === 'COED') return <CoedIcon fontSize="small" sx={{ color: '#6a1b9a' }} />;
  return <CoedIcon fontSize="small" color="disabled" />;
};

const genderColorHex = (gender: Gender | null): string => {
  if (gender === 'MALE') return '#1976d2';
  if (gender === 'FEMALE') return '#d81b60';
  if (gender === 'COED') return '#6a1b9a';
  return '#9e9e9e';
};

export default function EchelonsPage(): React.JSX.Element {
  const { t } = useTranslation();

  const [echelons, setEchelons] = useState<EchelonInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<Gender | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEchelon, setEditingEchelon] = useState<EchelonInterface | null>(null);
  const [formData, setFormData] = useState<EchelonInterface>(initialEchelon);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const genderLabel = useCallback(
    (gender: Gender | null): string => {
      if (gender === 'MALE') return t('gender.male');
      if (gender === 'FEMALE') return t('gender.female');
      if (gender === 'COED') return t('gender.coed');
      return t('common.unknown');
    },
    [t]
  );

  useEffect(() => {
    const fetchEchelons = async (): Promise<void> => {
      try {
        const res = await fetch('/api/echelons');
        if (!res.ok) throw new Error('Failed to fetch echelons');
        const data = await res.json();
        setEchelons(data);
      } catch (err) {
        log.error('Error fetching echelons:', err);
        setErrorMessage(t('echelon.failedFetch'));
      } finally {
        setLoading(false);
      }
    };
    fetchEchelons();
  }, [t]);

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
      setErrorMessage(t('messages.missingFields'));
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
        t('echelon.save.success', {
          status: editingEchelon ? t('status.updated') : t('status.created'),
        })
      );
      handleCloseDialog();
    } catch (err) {
      log.error('Error saving echelon:', err);
      setErrorMessage(
        t('echelon.save.error', {
          status: editingEchelon ? t('actions.update') : t('actions.create'),
        })
      );
    }
  };

  const confirmDelete = useCallback((id: number | null): void => {
    if (!id) return;
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const filteredEchelons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return echelons.filter((e) => {
      if (genderFilter !== 'ALL' && e.gender !== genderFilter) return false;
      if (!q) return true;
      return e.name.toLowerCase().includes(q) || (e.description ?? '').toLowerCase().includes(q);
    });
  }, [echelons, genderFilter, search]);

  const sortedEchelons = useMemo(
    () =>
      [...filteredEchelons].sort((a, b) => {
        const minA = a.minAge ?? 999;
        const minB = b.minAge ?? 999;
        if (minA !== minB) return minA - minB;
        return a.name.localeCompare(b.name, 'pt');
      }),
    [filteredEchelons]
  );

  const counts = useMemo(() => {
    return {
      ALL: echelons.length,
      MALE: echelons.filter((e) => e.gender === 'MALE').length,
      FEMALE: echelons.filter((e) => e.gender === 'FEMALE').length,
      COED: echelons.filter((e) => e.gender === 'COED').length,
    };
  }, [echelons]);

  const handleDelete = async (): Promise<void> => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/echelons/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());

      setEchelons((prev) => prev.filter((e) => e.id !== deleteId));
      setSuccessMessage(t('echelon.save.success', { status: t('status.deleted') }));
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    } catch (err) {
      log.error('Error deleting echelon:', err);
      setErrorMessage(t('echelon.save.error', { status: t('actions.delete') }));
    }
  };

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('echelon.management')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {echelons.length} {t('echelon.title').toLowerCase()}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          {t('echelon.addNew')}
        </Button>
      </Box>

      {/* Toolbar */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <ToggleButtonGroup
          size="small"
          exclusive
          value={genderFilter}
          onChange={(_, value) => {
            if (value !== null) setGenderFilter(value as Gender | 'ALL');
          }}
        >
          <ToggleButton value="ALL">
            {t('common.all')} ({counts.ALL})
          </ToggleButton>
          <ToggleButton value="MALE">
            <MaleIcon fontSize="small" sx={{ mr: 0.5, color: '#1976d2' }} />
            {t('gender.male')} ({counts.MALE})
          </ToggleButton>
          <ToggleButton value="FEMALE">
            <FemaleIcon fontSize="small" sx={{ mr: 0.5, color: '#d81b60' }} />
            {t('gender.female')} ({counts.FEMALE})
          </ToggleButton>
          <ToggleButton value="COED">
            <CoedIcon fontSize="small" sx={{ mr: 0.5, color: '#6a1b9a' }} />
            {t('gender.coed')} ({counts.COED})
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {sortedEchelons.length} {t('common.visible')}
        </Typography>
      </Paper>

      {loading && <Typography color="text.secondary">{t('common.loading')}</Typography>}

      {!loading && sortedEchelons.length === 0 && (
        <Typography color="text.secondary">{t('echelon.fetch.error')}</Typography>
      )}

      {/* Card grid */}
      <Grid container spacing={2}>
        {sortedEchelons.map((e) => {
          const color = genderColorHex(e.gender);
          return (
            <Grid key={e.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  borderLeft: `4px solid ${color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 3 },
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Avatar sx={{ width: 36, height: 36, bgcolor: color }}>
                      {genderIcon(e.gender)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.2,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {e.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {genderLabel(e.gender)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                    <Tooltip title={t('common.age')}>
                      <Chip
                        size="small"
                        icon={<CakeIcon sx={{ fontSize: 14 }} />}
                        label={
                          e.maxAge ? `${e.minAge ?? '?'} – ${e.maxAge}` : `${e.minAge ?? '?'}+`
                        }
                        variant="outlined"
                      />
                    </Tooltip>
                  </Box>

                  {e.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {e.description}
                    </Typography>
                  )}
                </CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Tooltip title={t('actions.edit')}>
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(e)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('actions.delete')}>
                    <IconButton size="small" color="error" onClick={() => confirmDelete(e.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingEchelon ? t('echelon.update') : t('echelon.create')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label={t('common.name')}
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('echelon.minAge')}
                type="number"
                value={formData.minAge ?? ''}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    minAge: event.target.value === '' ? null : Number(event.target.value),
                  })
                }
                required
                fullWidth
              />
              <TextField
                label={t('echelon.maxAge')}
                type="number"
                value={formData.maxAge ?? ''}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    maxAge: event.target.value === '' ? null : Number(event.target.value),
                  })
                }
                fullWidth
              />
            </Box>
            <FormControl fullWidth required>
              <InputLabel>{t('gender.label')}</InputLabel>
              <Select
                value={formData.gender ?? ''}
                label={t('gender.label')}
                onChange={(event) =>
                  setFormData({ ...formData, gender: event.target.value as Gender })
                }
              >
                {Object.values(Gender).map((value) => (
                  <MenuItem key={value} value={value}>
                    {genderLabel(value)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('common.description')}
              value={formData.description ?? ''}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t('messages.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('messages.deleteConfirmation')}</DialogContentText>
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
