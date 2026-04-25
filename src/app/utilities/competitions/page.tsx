'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
  Alert,
  TextField,
  Select,
  MenuItem,
  Stack,
  Avatar,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Paper,
  Chip,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTranslation } from 'react-i18next';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';
import { CompetitionInterface, CompetitionSerieInterface } from '@/types/competition/types';
import { EchelonInterface } from '@/types/echelons/types';
import { useCompetitions, useDeleteCompetition, useSaveCompetition } from '@/hooks/useCompetitions';
import { useEchelons } from '@/hooks/useEchelons';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';
import { motion, AnimatePresence } from 'framer-motion';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const CompetitionsPage: React.FC = () => {
  const initialSeries: CompetitionSerieInterface = {
    id: null,
    name: '',
    fpbSerieId: undefined,
  };

  const { t } = useTranslation();

  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(5000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);

  const {
    data: competitions = [] as CompetitionInterface[],
    isLoading: loadingCompetitions,
    error: competitionsError,
  } = useCompetitions();
  const { data: echelons = [] as EchelonInterface[], error: echelonsError } = useEchelons();
  const saveMutation = useSaveCompetition();
  const deleteMutation = useDeleteCompetition();
  const loading = loadingCompetitions;
  const [filteredEchelon, setFilteredEchelon] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [expandedEchelon, setExpandedEchelon] = useState<string | false>(false);
  const [initialExpandDone, setInitialExpandDone] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionInterface | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [newSeries, setNewSeries] = useState<CompetitionSerieInterface>(initialSeries);

  const isCompetitionDirty = useFormSnapshotDirty(openDialog, {
    selectedCompetition,
    newSeries,
  });

  const [editingSerie, setEditingSerie] = useState<CompetitionSerieInterface | null>(null);

  const formatSerie = (serie: CompetitionSerieInterface): string => {
    return serie.fpbSerieId ? `${serie.name} (${serie.fpbSerieId})` : serie.name;
  };

  useEffect(() => {
    const err = competitionsError || echelonsError;
    if (err) {
      log.error('Error fetching competitions:', err);
      setErrorMessage(err instanceof Error ? err.message : t('messages.fetchError'));
    }
  }, [competitionsError, echelonsError, setErrorMessage, t]);

  const handleSaveCompetition = (): void => {
    if (!selectedCompetition) return;
    const isEditing = !!selectedCompetition.id;
    saveMutation.mutate(selectedCompetition, {
      onSuccess: () => {
        setSuccessMessage(isEditing ? t('messages.saveSuccess') : t('messages.addSuccess'));
        setOpenDialog(false);
      },
      onError: (err) => {
        log.error('Error saving competition:', err);
        setErrorMessage(err instanceof Error ? err.message : t('messages.saveError'));
      },
    });
  };

  const handleDeleteCompetition = (id: number): void => {
    deleteMutation.mutate(id, {
      onSuccess: () => setSuccessMessage(t('messages.deleteSuccess')),
      onError: (err) => {
        log.error('Error deleting competition:', err);
        setErrorMessage(err instanceof Error ? err.message : t('messages.deleteError'));
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        setSelectedCompetition((prev) => ({ ...prev!, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSeries = (id: number): void => {
    setSelectedCompetition((prev) => ({
      ...prev!,
      competitionSeries: prev?.competitionSeries?.filter((s) => s.id !== id),
    }));
  };

  const filteredCompetitions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return competitions.filter((c) => {
      if (filteredEchelon !== '' && c.echelonId !== filteredEchelon) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.echelon?.name ?? '').toLowerCase().includes(q) ||
        (c.competitionSeries ?? []).some((s) => s.name.toLowerCase().includes(q))
      );
    });
  }, [competitions, filteredEchelon, search]);

  const groupedByEchelon = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; competitions: CompetitionInterface[] }
    >();
    const UNASSIGNED = '__unassigned__';

    for (const c of filteredCompetitions) {
      const key = c.echelonId ? String(c.echelonId) : UNASSIGNED;
      const name = c.echelon?.name ?? t('echelon.unknown');
      if (!map.has(key)) {
        map.set(key, { key, name, competitions: [] });
      }
      map.get(key)!.competitions.push(c);
    }

    return [...map.values()].sort((a, b) => {
      if (a.key === UNASSIGNED) return 1;
      if (b.key === UNASSIGNED) return -1;
      return a.name.localeCompare(b.name, 'pt');
    });
  }, [filteredCompetitions, t]);

  useEffect(() => {
    if (!initialExpandDone && groupedByEchelon.length > 0) {
      setExpandedEchelon(groupedByEchelon[0].key);
      setInitialExpandDone(true);
    }
  }, [groupedByEchelon, initialExpandDone]);

  const handleOpenNew = (): void => {
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
  };

  return (
    <Box>
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
            {t('competition.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {competitions.length} {t('competition.title').toLowerCase()}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenNew}>
          {t('competition.add')}
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

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
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t('echelon.singular')}</InputLabel>
          <Select
            label={t('echelon.singular')}
            value={filteredEchelon}
            onChange={(e) => {
              const v = e.target.value as number | '';
              setFilteredEchelon(v === '' ? '' : Number(v));
            }}
          >
            <MenuItem value="">{t('echelon.all')}</MenuItem>
            {echelons.map((ech) => (
              <MenuItem key={Number(ech.id)} value={Number(ech.id)}>
                {ech.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {filteredCompetitions.length} {t('common.visible')}
        </Typography>
      </Paper>

      {loading && <Typography color="text.secondary">{t('common.loading')}</Typography>}

      {!loading && groupedByEchelon.length === 0 && (
        <Typography color="text.secondary">{t('messages.noData')}</Typography>
      )}

      {/* Grouped by echelon */}
      {!loading &&
        groupedByEchelon.map((group) => (
          <Accordion
            key={group.key}
            expanded={expandedEchelon === group.key}
            onChange={(_, isExpanded) => setExpandedEchelon(isExpanded ? group.key : false)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 2 }}>
                <EmojiEventsIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {group.name}
                </Typography>
                <Chip
                  size="small"
                  label={`${group.competitions.length} ${t('competition.title').toLowerCase()}`}
                  sx={{ ml: 'auto' }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {group.competitions.map((c) => (
                  <Grid key={c.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: 3 },
                      }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                          <Avatar
                            src={c.image || undefined}
                            sx={{
                              width: 48,
                              height: 48,
                              bgcolor: c.image ? 'transparent' : stringToColor(c.name),
                              fontWeight: 700,
                            }}
                          >
                            {!c.image && getInitials(c.name)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 700,
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {c.name}
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 0.5,
                                mt: 0.5,
                                flexWrap: 'wrap',
                                alignItems: 'center',
                              }}
                            >
                              {c.echelon?.name && (
                                <Chip
                                  size="small"
                                  label={c.echelon.name}
                                  variant="outlined"
                                  color="primary"
                                />
                              )}
                              {c.fpbCompetitionId && (
                                <Tooltip title={`${t('competition.fpbId')}: ${c.fpbCompetitionId}`}>
                                  <Chip
                                    size="small"
                                    icon={<SportsBasketballIcon sx={{ fontSize: 14 }} />}
                                    label="FPB"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ fontWeight: 700 }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {c.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              mb: 1,
                            }}
                          >
                            {c.description}
                          </Typography>
                        )}

                        {c.competitionSeries && c.competitionSeries.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {c.competitionSeries.map((s) => (
                              <Chip
                                key={s.id}
                                label={formatSerie(s)}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            {t('competition.noSeries')}
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
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setSelectedCompetition(c);
                              setOpenDialog(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('actions.delete')}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              c.id !== null && c.id !== undefined && setDeleteConfirmId(c.id)
                            }
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}

      {/* Dialog Add/Edit */}
      <GuardedDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        isDirty={isCompetitionDirty}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedCompetition?.id ? t('competition.edit') : t('competition.add')}
        </DialogTitle>
        <DialogContent>
          {selectedCompetition && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('common.name')}
                  fullWidth
                  value={selectedCompetition.name}
                  onChange={(e) =>
                    setSelectedCompetition((prev) => ({ ...prev!, name: e.target.value }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('echelon.singular')}</InputLabel>
                  <Select
                    label={t('echelon.singular')}
                    value={selectedCompetition.echelonId ?? ''}
                    onChange={(e) => {
                      const v = e.target.value as number | '';
                      setSelectedCompetition((prev) => ({
                        ...prev!,
                        echelonId: v === '' ? null : Number(v),
                      }));
                    }}
                  >
                    <MenuItem value="">{t('echelon.select')}</MenuItem>
                    {echelons.map((ech) => (
                      <MenuItem key={Number(ech.id)} value={Number(ech.id)}>
                        {ech.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t('competition.fpbId')}
                  type="number"
                  value={selectedCompetition.fpbCompetitionId ?? ''}
                  onChange={(e) =>
                    setSelectedCompetition((prev) => ({
                      ...prev!,
                      fpbCompetitionId: e.target.value === '' ? undefined : Number(e.target.value),
                    }))
                  }
                  slotProps={{ htmlInput: { min: 0 } }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t('common.description')}
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

              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Avatar
                    src={selectedCompetition.image || ''}
                    alt={selectedCompetition.name}
                    sx={{ width: 60, height: 60 }}
                  />
                  <Button variant="outlined" component="label">
                    {t('images.upload')}
                    <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
                  </Button>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('competition.series')}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    flexWrap: 'wrap',
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
                            label={formatSerie(serie)}
                            color="primary"
                            variant="outlined"
                            onDelete={() => handleRemoveSeries(Number(serie.id))}
                            sx={{ fontSize: '0.9rem', m: 0.5, px: 1.2 }}
                          />
                          <IconButton onClick={() => setEditingSerie(serie)}>
                            <EditIcon />
                          </IconButton>
                        </motion.div>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1, opacity: 0.7 }}
                      >
                        {t('competition.noSeries')}
                      </Typography>
                    )}
                  </AnimatePresence>
                </Stack>

                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <TextField
                    label={t('competition.newSeries')}
                    placeholder={t('competition.seriesName')}
                    value={newSeries.name}
                    onChange={(e) =>
                      setNewSeries((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />

                  <TextField
                    label={t('competition.fpbSerieId')}
                    type="number"
                    value={newSeries.fpbSerieId ?? ''}
                    onChange={(e) =>
                      setNewSeries((prev) => ({
                        ...prev,
                        fpbSerieId: e.target.value === '' ? undefined : Number(e.target.value),
                      }))
                    }
                    slotProps={{ htmlInput: { min: 0 } }}
                  />
                  <IconButton
                    color="primary"
                    disabled={!!editingSerie}
                    onClick={() => {
                      const serieName = newSeries.name.trim();
                      if (!serieName || !selectedCompetition) return;

                      const serieToAdd: CompetitionSerieInterface = {
                        ...newSeries,
                        id: Date.now(),
                        name: serieName,
                      };

                      setSelectedCompetition((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          competitionSeries: [...(prev.competitionSeries ?? []), serieToAdd],
                        };
                      });

                      setNewSeries(initialSeries);
                    }}
                  >
                    <AddCircleOutlineIcon fontSize="large" />
                  </IconButton>
                </Stack>

                {editingSerie && (
                  <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 2 }}>
                    <TextField
                      label={t('competition.seriesName')}
                      value={editingSerie.name}
                      onChange={(e) =>
                        setEditingSerie((prev) =>
                          prev
                            ? {
                                ...prev,
                                name: e.target.value,
                              }
                            : prev
                        )
                      }
                    />

                    <TextField
                      label={t('competition.fpbSerieId')}
                      type="number"
                      value={editingSerie.fpbSerieId ?? ''}
                      onChange={(e) =>
                        setEditingSerie((prev) =>
                          prev
                            ? {
                                ...prev,
                                fpbSerieId:
                                  e.target.value === '' ? undefined : Number(e.target.value),
                              }
                            : prev
                        )
                      }
                      slotProps={{ htmlInput: { min: 0 } }}
                    />

                    <Button
                      variant="contained"
                      onClick={() => {
                        if (!selectedCompetition || !editingSerie) return;

                        setSelectedCompetition((prev) => {
                          if (!prev) return prev;

                          const updated = (prev.competitionSeries ?? []).map((s) =>
                            s.id === editingSerie.id ? editingSerie : s
                          );

                          return {
                            ...prev,
                            competitionSeries: updated,
                          };
                        });

                        setEditingSerie(null);
                      }}
                    >
                      {t('actions.save')}
                    </Button>

                    <Button onClick={() => setEditingSerie(null)}>{t('actions.cancel')}</Button>
                  </Stack>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveCompetition}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('messages.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('messages.deleteConfirmation')}
            <br />
            <strong>{competitions.find((c) => c.id === deleteConfirmId)?.name ?? ''}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('actions.cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteConfirmId) handleDeleteCompetition(deleteConfirmId);
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

export default CompetitionsPage;
