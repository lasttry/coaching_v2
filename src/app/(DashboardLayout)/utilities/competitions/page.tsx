'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Alert,
  TextField,
  Select,
  MenuItem,
  Stack,
  Grid,
  Avatar,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';
import { CompetitionInterface } from '@/types/competition/types';
import { EchelonInterface } from '@/types/echelons/types';
import { motion, AnimatePresence } from 'framer-motion';
import Chip from '@mui/material/Chip';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const CompetitionsPage: React.FC = () => {
  const { t } = useTranslation();

  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(5000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);

  const [competitions, setCompetitions] = useState<CompetitionInterface[]>([]);
  const [echelons, setEchelons] = useState<EchelonInterface[]>([]);
  const [filteredEchelon, setFilteredEchelon] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionInterface | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [newSeriesName, setNewSeriesName] = useState('');

  // ✅ Fetch Competitions & Echelons
  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [compRes, echRes] = await Promise.all([
        fetch('/api/competition'),
        fetch('/api/echelons'),
      ]);
      const [compData, echData] = await Promise.all([compRes.json(), echRes.json()]);
      if (!compRes.ok || !echRes.ok) throw new Error('Failed to fetch data');
      setCompetitions(compData);
      setEchelons(echData);
    } catch (err) {
      log.error('Error fetching competitions:', err);
      setErrorMessage(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  // ✅ Save Competition (Create/Update)
  const handleSaveCompetition = async (): Promise<void> => {
    if (!selectedCompetition) return;
    try {
      const method = selectedCompetition.id ? 'PUT' : 'POST';
      const url = selectedCompetition.id
        ? `/api/competition/${selectedCompetition.id}`
        : '/api/competition';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedCompetition),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save competition');

      setSuccessMessage(selectedCompetition.id ? t('saveSuccess') : t('addSuccess'));
      setOpenDialog(false);
      await fetchData();
    } catch (err) {
      log.error('Error saving competition:', err);
      setErrorMessage(t('saveError'));
    }
  };

  // ✅ Delete Competition
  const handleDeleteCompetition = async (id: number): Promise<void> => {
    try {
      const res = await fetch(`/api/competition/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || t('deleteError'));
      setCompetitions((prev) => prev.filter((c) => c.id !== id));
      setSuccessMessage(t('deleteSuccess'));
    } catch (err) {
      log.error('Error deleting competition:', err);
      setErrorMessage(t('deleteError'));
    }
  };

  // ✅ Upload image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setSelectedCompetition((prev) => ({ ...prev!, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  // ✅ Series management
  const handleAddSeries = (): void => {
    const name = prompt(t('enterSeriesName') || 'Series name');
    if (name && selectedCompetition) {
      setSelectedCompetition((prev) => ({
        ...prev!,
        competitionSeries: [
          ...(prev?.competitionSeries || []),
          { id: Date.now(), name },
        ],
      }));
    }
  };

  const handleRemoveSeries = (id: number): void => {
    setSelectedCompetition((prev) => ({
      ...prev!,
      competitionSeries: prev?.competitionSeries?.filter((s) => s.id !== id),
    }));
  };

  // ✅ Columns
  const columns: GridColDef<CompetitionInterface>[] = [
    {
      field: 'image',
      headerName: '',
      flex: 0.5,
      renderCell: (params) =>
        params.row.image ? (
          <Avatar src={params.row.image} alt={params.row.name} sx={{ width: 40, height: 40 }} />
        ) : (
          <Avatar sx={{ width: 40, height: 40 }}>{params.row.name.charAt(0)}</Avatar>
        ),
    },
    { field: 'name', headerName: t('name'), flex: 2 },
    { field: 'description', headerName: t('description'), flex: 3 },
    {
      field: 'echelon',
      headerName: t('echelon'),
      flex: 1,
      valueFormatter: (_value, row) => row.echelon?.name ?? '-',
    },
    {
      field: 'actions',
      headerName: t('actions'),
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Button
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => {
              setSelectedCompetition(params.row);
              setOpenDialog(true);
            }}
          >
            {t('edit')}
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => setDeleteConfirmId(params.row.id!)}
          >
            {t('delete')}
          </Button>
        </Box>
      ),
    },
  ];

  // ✅ Filter competitions
  const filteredCompetitions = filteredEchelon
    ? competitions.filter((c) => c.echelonId === filteredEchelon)
    : competitions;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">{t('competitions')}</Typography>
        <Stack direction="row" spacing={2}>
          <Select
            size="small"
            value={filteredEchelon}
            onChange={(e) => setFilteredEchelon(e.target.value as number | '')}
            displayEmpty
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">{t('allEchelons')}</MenuItem>
            {echelons.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.name}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            onClick={() => {
              setSelectedCompetition({
                id: null,
                name: '',
                description: '',
                echelonId: null,
                image: null,
                competitionSeries: [],
                echelon: null,
              });
              setOpenDialog(true);
            }}
          >
            {t('addCompetition')}
          </Button>
        </Stack>
      </Box>

      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <DataGrid
        rows={filteredCompetitions}
        columns={columns}
        getRowId={(row) => row.id!}
        autoHeight
        pagination
        pageSizeOptions={[5, 10, 20]}
        loading={loading}
        disableRowSelectionOnClick
      />

      {/* Dialog Add/Edit */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCompetition?.id ? t('editCompetition') : t('addCompetition')}
        </DialogTitle>
        <DialogContent>
          {selectedCompetition && (
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('name')}
                  fullWidth
                  value={selectedCompetition.name}
                  onChange={(e) =>
                    setSelectedCompetition((prev) => ({ ...prev!, name: e.target.value }))
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Select
                  value={selectedCompetition.echelonId ?? ''}
                  onChange={(e) =>
                    setSelectedCompetition((prev) => ({
                      ...prev!,
                      echelonId: Number(e.target.value),
                    }))
                  }
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="">{t('selectEchelon')}</MenuItem>
                  {echelons.map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.name}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label={t('description')}
                  fullWidth
                  multiline
                  value={selectedCompetition.description || ''}
                  onChange={(e) =>
                    setSelectedCompetition((prev) => ({
                      ...prev!,
                      description: e.target.value,
                    }))
                  }
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={selectedCompetition.image || ''}
                    alt={selectedCompetition.name}
                    sx={{ width: 60, height: 60 }}
                  />
                  <Button variant="outlined" component="label">
                    {t('uploadImage')}
                    <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
                  </Button>
                </Stack>
              </Grid>

              {/* Series Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('series')}
                </Typography>

                {/* Lista animada de séries */}
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  spacing={1}
                  sx={{
                    p: 1,
                    mb: 2,
                    borderRadius: 2,
                    minHeight: 50,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <AnimatePresence>
                    {selectedCompetition?.competitionSeries?.length ? (
                      selectedCompetition.competitionSeries.map((serie) => (
                        <motion.div
                          key={serie.id}
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <Chip
                            label={serie.name}
                            color="primary"
                            variant="outlined"
                            onDelete={() => handleRemoveSeries(serie.id)}
                            sx={{
                              fontSize: '0.9rem',
                              m: 0.5,
                              px: 1.2,
                            }}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1, opacity: 0.7 }}
                      >
                        {t('noSeries')}
                      </Typography>
                    )}
                  </AnimatePresence>
                </Stack>

                {/* Input para adicionar nova série */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label={t('newSeries')}
                    placeholder={t('seriesName')}
                    fullWidth
                    size="small"
                    value={newSeriesName}
                    onChange={(e) => setNewSeriesName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newSeriesName.trim()) {
                        const newSerie = { id: Date.now(), name: newSeriesName.trim() };
                        setSelectedCompetition((prev) => ({
                          ...prev!,
                          competitionSeries: [...(prev?.competitionSeries || []), newSerie],
                        }));
                        setNewSeriesName('');
                      }
                    }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => {
                      if (!newSeriesName.trim()) return;
                      const newSerie = { id: Date.now(), name: newSeriesName.trim() };
                      setSelectedCompetition((prev) => ({
                        ...prev!,
                        competitionSeries: [...(prev?.competitionSeries || []), newSerie],
                      }));
                      setNewSeriesName('');
                    }}
                  >
                    <AddCircleOutlineIcon fontSize="large" />
                  </IconButton>
                </Stack>
              </Grid>


            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSaveCompetition}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('deleteConfirmationMessage')} <br />
            <strong>{competitions.find((c) => c.id === deleteConfirmId)?.name ?? ''}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteConfirmId) handleDeleteCompetition(deleteConfirmId);
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

export default CompetitionsPage;