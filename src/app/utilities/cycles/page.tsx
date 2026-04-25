'use client';

import React, { ReactElement, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import PageContainer from '@/app/components/container/PageContainer';
import MicrocycleDetailsDialog from '@/app/components/shared/MicrocycleDetailsDialog';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt';
import 'dayjs/locale/en';
import {
  MacrocycleInterface,
  MesocycleInterface,
  MicrocycleInterface,
  SessionGoalInterface,
} from '@/types/cycles/types';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';
import {
  useDeleteMacrocycle,
  useDeleteMesocycle,
  useDeleteMicrocycle,
  useMacrocycles,
  useMicrocycles,
  useSaveMacrocycle,
  useSaveMesocycle,
  useSaveMicrocycle,
} from '@/hooks/useCycles';
import { useTeams } from '@/hooks/useTeams';
import { useQueryClient } from '@tanstack/react-query';
import { seasonsKeys } from '@/hooks/useSeasons';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';
import GroupsIcon from '@mui/icons-material/Groups';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

dayjs.extend(localizedFormat);

type Level = 'macro' | 'meso' | 'micro';

interface CycleFormState {
  level: Level;
  id: number | null;
  teamId: string;
  macrocycleId: string;
  mesocycleId: string;
  number: string;
  name: string;
  startDate: string;
  endDate: string;
  notes: string;
}

const EMPTY_FORM: CycleFormState = {
  level: 'macro',
  id: null,
  teamId: '',
  macrocycleId: '',
  mesocycleId: '',
  number: '',
  name: '',
  startDate: '',
  endDate: '',
  notes: '',
};

interface DeleteTarget {
  level: Level;
  id: number;
  label: string;
}

const SEGMENT_COLORS = [
  '#5D87FF',
  '#49BEFF',
  '#13DEB9',
  '#FFAE1F',
  '#FA896B',
  '#539BFF',
  '#A7E6FF',
];

function pct(start: Date, end: Date, now: number): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (e <= s) return 0;
  return Math.min(100, Math.max(0, ((now - s) / (e - s)) * 100));
}

function weeksBetween(start: Date, end: Date): number {
  const s = dayjs(start);
  const e = dayjs(end);
  return Math.max(1, Math.round(e.diff(s, 'week', true)));
}

function isCurrent(start: Date, end: Date): boolean {
  const now = Date.now();
  return new Date(start).getTime() <= now && now <= new Date(end).getTime();
}

interface TimelineProps {
  start: Date;
  end: Date;
  segments?: { start: Date; end: Date; label: string; colorIdx: number }[];
}

const Timeline: React.FC<TimelineProps> = ({ start, end, segments = [] }) => {
  const now = Date.now();
  const position = pct(start, end, now);
  const startTs = new Date(start).getTime();
  const endTs = new Date(end).getTime();

  return (
    <Box sx={{ position: 'relative', width: '100%', mt: 0.5 }}>
      <Box
        sx={{
          position: 'relative',
          height: 10,
          borderRadius: 5,
          backgroundColor: 'action.hover',
          overflow: 'hidden',
        }}
      >
        {segments.map((seg, idx) => {
          const s = Math.max(0, pct(start, end, new Date(seg.start).getTime()));
          const e = Math.min(100, pct(start, end, new Date(seg.end).getTime()));
          const width = Math.max(0.5, e - s);
          const active = now >= new Date(seg.start).getTime() && now <= new Date(seg.end).getTime();
          return (
            <Tooltip
              key={`${seg.label}-${idx}`}
              title={`${seg.label} · ${dayjs(seg.start).format('L')} - ${dayjs(seg.end).format('L')}`}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${s}%`,
                  width: `${width}%`,
                  height: '100%',
                  backgroundColor: SEGMENT_COLORS[seg.colorIdx % SEGMENT_COLORS.length],
                  opacity: active ? 1 : 0.55,
                  borderRight: '1px solid rgba(255,255,255,0.5)',
                }}
              />
            </Tooltip>
          );
        })}
        {now >= startTs && now <= endTs && (
          <Box
            sx={{
              position: 'absolute',
              left: `${position}%`,
              top: -2,
              height: 14,
              width: 2,
              backgroundColor: 'error.main',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.6)',
            }}
          />
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {dayjs(start).format('L')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {dayjs(end).format('L')}
        </Typography>
      </Box>
    </Box>
  );
};

const CyclesPage = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const currentLocale = i18n.language?.startsWith('pt') ? 'pt' : 'en';

  const { data: macroCycles = [], isLoading: macrosLoading } = useMacrocycles();
  const { data: allMicrocycles = [] } = useMicrocycles();
  const { data: teams = [] } = useTeams();

  const saveMacroMutation = useSaveMacrocycle();
  const saveMesoMutation = useSaveMesocycle();
  const saveMicroMutation = useSaveMicrocycle();
  const deleteMacroMutation = useDeleteMacrocycle();
  const deleteMesoMutation = useDeleteMesocycle();
  const deleteMicroMutation = useDeleteMicrocycle();

  const { message: error, setTimedMessage: setError } = useMessage(5000);
  const { message: success, setTimedMessage: setSuccess } = useMessage(5000);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CycleFormState>(EMPTY_FORM);

  const isCycleFormDirty = useFormSnapshotDirty(dialogOpen, form);

  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<SessionGoalInterface[] | null>(null);
  const [detailsMacro, setDetailsMacro] = useState<MacrocycleInterface | null>(null);
  const [detailsMeso, setDetailsMeso] = useState<MesocycleInterface | null>(null);

  const formatDate = (d: Date): string => dayjs(d).locale(currentLocale).format('L');

  const microsByMeso = useMemo(() => {
    const map = new Map<number, MicrocycleInterface[]>();
    for (const m of allMicrocycles) {
      const list = map.get(m.mesocycleId) || [];
      list.push(m);
      map.set(m.mesocycleId, list);
    }
    for (const [k, v] of map.entries()) {
      map.set(
        k,
        v.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      );
    }
    return map;
  }, [allMicrocycles]);

  const stats = useMemo(() => {
    let mesos = 0;
    for (const m of macroCycles) mesos += m.mesocycles?.length ?? 0;
    return { macros: macroCycles.length, mesos, micros: allMicrocycles.length };
  }, [macroCycles, allMicrocycles]);

  const selectedMacro = useMemo(
    () => macroCycles.find((m) => String(m.id) === form.macrocycleId) || null,
    [macroCycles, form.macrocycleId]
  );

  const selectedMeso = useMemo<MesocycleInterface | null>(() => {
    if (!selectedMacro) return null;
    return selectedMacro.mesocycles?.find((m) => String(m.id) === form.mesocycleId) ?? null;
  }, [selectedMacro, form.mesocycleId]);

  // ----- Open dialog helpers -----

  const openAddMacro = async (): Promise<void> => {
    const last = [...macroCycles].sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    )[0];
    let baseStart = last ? dayjs(last.endDate) : null;
    if (!baseStart) {
      try {
        const season = await qc.fetchQuery({
          queryKey: seasonsKeys.current(),
          queryFn: async () => {
            const res = await fetch('/api/seasons/current');
            if (!res.ok) return null;
            return res.json();
          },
        });
        if (season?.startDate) baseStart = dayjs(season.startDate);
      } catch (err) {
        log.error('Error fetching current season:', err);
      }
    }
    setForm({
      ...EMPTY_FORM,
      level: 'macro',
      startDate: baseStart ? baseStart.format('YYYY-MM-DDTHH:mm') : '',
      endDate: baseStart ? baseStart.add(1, 'month').format('YYYY-MM-DDTHH:mm') : '',
    });
    setDialogOpen(true);
  };

  const openEditMacro = (macro: MacrocycleInterface): void => {
    setForm({
      ...EMPTY_FORM,
      level: 'macro',
      id: macro.id,
      teamId: macro.teamId ? String(macro.teamId) : '',
      name: macro.name || '',
      startDate: dayjs(macro.startDate).format('YYYY-MM-DDTHH:mm'),
      endDate: dayjs(macro.endDate).format('YYYY-MM-DDTHH:mm'),
      notes: macro.notes || '',
    });
    setDialogOpen(true);
  };

  const openAddMeso = (macro: MacrocycleInterface): void => {
    const sorted = [...(macro.mesocycles || [])].sort(
      (a, b) =>
        new Date((b.endDate as Date) || 0).getTime() - new Date((a.endDate as Date) || 0).getTime()
    );
    const referenceStart = sorted.length
      ? dayjs(sorted[0].endDate as Date)
      : dayjs(macro.startDate);
    const macroEnd = dayjs(macro.endDate);
    const suggestedEnd = referenceStart.add(1, 'month');
    const boundedEnd = suggestedEnd.isAfter(macroEnd) ? macroEnd : suggestedEnd;
    setForm({
      ...EMPTY_FORM,
      level: 'meso',
      macrocycleId: String(macro.id),
      startDate: referenceStart.format('YYYY-MM-DD'),
      endDate: boundedEnd.format('YYYY-MM-DD'),
    });
    setDialogOpen(true);
  };

  const openEditMeso = (macro: MacrocycleInterface, meso: MesocycleInterface): void => {
    setForm({
      ...EMPTY_FORM,
      level: 'meso',
      id: meso.id,
      macrocycleId: String(macro.id),
      name: meso.name || '',
      startDate: meso.startDate ? dayjs(meso.startDate).format('YYYY-MM-DD') : '',
      endDate: meso.endDate ? dayjs(meso.endDate).format('YYYY-MM-DD') : '',
      notes: meso.notes || '',
    });
    setDialogOpen(true);
  };

  const openAddMicro = (macro: MacrocycleInterface, meso: MesocycleInterface): void => {
    const micros = microsByMeso.get(meso.id) ?? [];
    const sorted = [...micros].sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    );
    const base = sorted.length
      ? dayjs(sorted[0].endDate)
      : dayjs(meso.startDate ?? macro.startDate);
    const boundEnd = dayjs(meso.endDate ?? macro.endDate);
    const suggestedEnd = base.add(1, 'week');
    const end = suggestedEnd.isAfter(boundEnd) ? boundEnd : suggestedEnd;
    setForm({
      ...EMPTY_FORM,
      level: 'micro',
      macrocycleId: String(macro.id),
      mesocycleId: String(meso.id),
      number: String((sorted[0]?.number ?? 0) + 1 || ''),
      startDate: base.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD'),
    });
    setDialogOpen(true);
  };

  const openEditMicro = (micro: MicrocycleInterface): void => {
    setForm({
      ...EMPTY_FORM,
      level: 'micro',
      id: micro.id,
      macrocycleId: String(micro.mesocycle?.macrocycle?.id || ''),
      mesocycleId: String(micro.mesocycle?.id || ''),
      number: String(micro.number ?? ''),
      name: micro.name || '',
      startDate: dayjs(micro.startDate).format('YYYY-MM-DD'),
      endDate: dayjs(micro.endDate).format('YYYY-MM-DD'),
      notes: micro.notes || '',
    });
    setDialogOpen(true);
  };

  const closeDialog = (): void => {
    setDialogOpen(false);
  };

  // ----- Save -----

  const handleSave = (): void => {
    if (!form.startDate || !form.endDate) {
      setError(t('cycles.macrocycle.validation.datesRequired'));
      return;
    }

    if (form.level === 'macro') {
      if (!form.teamId) {
        setError(t('cycles.macrocycle.validation.teamRequired'));
        return;
      }
      const isEditing = Boolean(form.id);
      saveMacroMutation.mutate(
        {
          id: form.id,
          teamId: Number(form.teamId),
          name: form.name,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          notes: form.notes,
        },
        {
          onSuccess: () => {
            setSuccess(
              isEditing
                ? t('cycles.macrocycle.save.updateSuccess')
                : t('cycles.macrocycle.save.createSuccess')
            );
            closeDialog();
          },
          onError: (err) => {
            log.error('Error saving macrocycle:', err);
            setError(err instanceof Error ? err.message : t('cycles.macrocycle.save.error'));
          },
        }
      );
      return;
    }

    if (form.level === 'meso') {
      if (!form.macrocycleId) {
        setError(t('messages.missingFields'));
        return;
      }
      if (selectedMacro) {
        const macroStart = dayjs(selectedMacro.startDate).startOf('day');
        const macroEnd = dayjs(selectedMacro.endDate).endOf('day');
        const s = dayjs(form.startDate).startOf('day');
        const e = dayjs(form.endDate).endOf('day');
        if (
          s.isBefore(macroStart) ||
          s.isAfter(macroEnd) ||
          e.isBefore(macroStart) ||
          e.isAfter(macroEnd)
        ) {
          setError(t('cycles.mesocycle.validation.dateOutOfRange'));
          return;
        }
        if (e.isBefore(s)) {
          setError(t('cycles.mesocycle.validation.endBeforeStart'));
          return;
        }
      }
      const isEditing = Boolean(form.id);
      saveMesoMutation.mutate(
        {
          id: form.id,
          macrocycleId: Number(form.macrocycleId),
          name: form.name,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          notes: form.notes,
        },
        {
          onSuccess: () => {
            setSuccess(
              isEditing
                ? t('cycles.mesocycle.save.updateSuccess')
                : t('cycles.mesocycle.save.createSuccess')
            );
            closeDialog();
          },
          onError: (err) => {
            log.error('Error saving mesocycle:', err);
            setError(err instanceof Error ? err.message : t('cycles.mesocycle.save.error'));
          },
        }
      );
      return;
    }

    // micro
    if (!form.mesocycleId) {
      setError(t('messages.missingFields'));
      return;
    }
    const isEditing = Boolean(form.id);
    const payload = {
      id: form.id,
      number: form.number ? Number(form.number) : null,
      name: form.name,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      notes: form.notes,
      ...(isEditing
        ? { mesocycleId: Number(form.mesocycleId), sessionGoals: [] }
        : { mesocycle: { id: Number(form.mesocycleId) }, sessionGoals: [] }),
    };
    saveMicroMutation.mutate(payload, {
      onSuccess: () => {
        setSuccess(
          isEditing
            ? t('cycles.microcycle.save.updateSuccess')
            : t('cycles.microcycle.save.createSuccess')
        );
        closeDialog();
      },
      onError: (err) => {
        log.error('Error saving microcycle:', err);
        setError(err instanceof Error ? err.message : t('cycles.microcycle.save.error'));
      },
    });
  };

  // ----- Delete -----

  const confirmDelete = (): void => {
    if (!deleteTarget) return;
    const { level, id, label } = deleteTarget;
    const onSuccess = (): void => {
      setSuccess(
        t(
          `cycles.${level === 'macro' ? 'macrocycle' : level === 'meso' ? 'mesocycle' : 'microcycle'}.save.deleteSuccess`,
          { id: label || id }
        )
      );
      setDeleteTarget(null);
    };
    const onError = (err: unknown): void => {
      log.error('Error deleting cycle:', err);
      setError(
        err instanceof Error
          ? err.message
          : t(
              `cycles.${level === 'macro' ? 'macrocycle' : level === 'meso' ? 'mesocycle' : 'microcycle'}.delete.error`
            )
      );
      setDeleteTarget(null);
    };
    if (level === 'macro') deleteMacroMutation.mutate(id, { onSuccess, onError });
    else if (level === 'meso') deleteMesoMutation.mutate(id, { onSuccess, onError });
    else deleteMicroMutation.mutate(id, { onSuccess, onError });
  };

  // ----- Details -----

  const openDetails = (
    macro: MacrocycleInterface,
    meso: MesocycleInterface,
    micro: MicrocycleInterface
  ): void => {
    setDetailsData(micro.sessionGoals || []);
    setDetailsMacro(macro);
    setDetailsMeso(meso);
    setDetailsOpen(true);
  };

  // ----- Render -----

  const saving =
    saveMacroMutation.isPending || saveMesoMutation.isPending || saveMicroMutation.isPending;

  return (
    <PageContainer title={t('cycles.title')} description={t('cycles.title')}>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('cycles.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('cycles.description')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            void openAddMacro();
          }}
        >
          {t('cycles.macrocycle.addNew')}
        </Button>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <StatCard
          icon={<CalendarMonthIcon color="primary" />}
          label={t('cycles.macrocycle.title')}
          value={stats.macros}
        />
        <StatCard
          icon={<EventAvailableIcon color="secondary" />}
          label={t('cycles.mesocycle.title')}
          value={stats.mesos}
        />
        <StatCard
          icon={<AutoAwesomeIcon color="success" />}
          label={t('cycles.microcycle.title')}
          value={stats.micros}
        />
      </Stack>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {macrosLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={120} />
          <Skeleton variant="rounded" height={120} />
        </Stack>
      ) : macroCycles.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed' }}>
          <CalendarMonthIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            {t('cycles.macrocycle.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('cycles.macrocycle.description')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              void openAddMacro();
            }}
          >
            {t('cycles.macrocycle.addNew')}
          </Button>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {macroCycles.map((macro) => {
            const macroCurrent = isCurrent(macro.startDate, macro.endDate);
            const mesos = macro.mesocycles || [];
            const segments = mesos
              .filter((m) => m.startDate && m.endDate)
              .map((m, idx) => ({
                start: m.startDate as Date,
                end: m.endDate as Date,
                label: m.name || `${t('cycles.mesocycle.singular')} ${m.number ?? m.id}`,
                colorIdx: idx,
              }));

            return (
              <Accordion key={macro.id} defaultExpanded={macroCurrent} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.75,
                      width: '100%',
                      pr: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        color="primary"
                        label={`${t('cycles.macrocycle.singular')} ${macro.number ?? macro.id}`}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {macro.name ||
                          `${t('cycles.macrocycle.singular')} ${macro.number ?? macro.id}`}
                      </Typography>
                      {macro.team ? (
                        <Chip
                          size="small"
                          icon={<GroupsIcon sx={{ fontSize: 16 }} />}
                          label={macro.team.name}
                          variant="outlined"
                        />
                      ) : (
                        <Tooltip title={t('cycles.macrocycle.validation.teamRequired')}>
                          <Chip
                            size="small"
                            color="warning"
                            icon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
                            label={t('cycles.macrocycle.noTeam')}
                          />
                        </Tooltip>
                      )}
                      {macroCurrent && (
                        <Chip size="small" color="success" label={t('common.current')} />
                      )}
                      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${weeksBetween(macro.startDate, macro.endDate)} ${t('common.weeks')}`}
                        />
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`${mesos.length} ${t('cycles.mesocycle.title').toLowerCase()}`}
                        />
                      </Box>
                    </Box>
                    <Timeline start={macro.startDate} end={macro.endDate} segments={segments} />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: 'action.hover' }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => openAddMeso(macro)}
                    >
                      {t('cycles.mesocycle.add')}
                    </Button>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                      <Tooltip title={t('actions.edit')}>
                        <IconButton size="small" onClick={() => openEditMacro(macro)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('actions.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setDeleteTarget({
                              level: 'macro',
                              id: macro.id,
                              label:
                                macro.name ||
                                `${t('cycles.macrocycle.singular')} ${macro.number ?? macro.id}`,
                            })
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {mesos.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontStyle: 'italic', px: 1 }}
                    >
                      {t('cycles.mesocycle.description')}
                    </Typography>
                  ) : (
                    <Stack spacing={1}>
                      {mesos.map((meso, mesoIdx) => {
                        const micros = microsByMeso.get(meso.id) ?? [];
                        const mesoCurrent =
                          meso.startDate && meso.endDate
                            ? isCurrent(meso.startDate, meso.endDate)
                            : false;
                        const microSegments = micros.map((m, idx) => ({
                          start: m.startDate,
                          end: m.endDate,
                          label: m.name || `${t('cycles.microcycle.singular')} ${m.number ?? m.id}`,
                          colorIdx: idx,
                        }));
                        return (
                          <Accordion
                            key={meso.id}
                            defaultExpanded={mesoCurrent}
                            disableGutters
                            sx={{ backgroundColor: 'background.paper' }}
                          >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 0.75,
                                  width: '100%',
                                  pr: 2,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <Chip
                                    size="small"
                                    color="secondary"
                                    label={`${macro.number ?? macro.id}.${meso.number ?? mesoIdx + 1}`}
                                  />
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    {meso.name ||
                                      `${t('cycles.mesocycle.singular')} ${meso.number ?? meso.id}`}
                                  </Typography>
                                  {mesoCurrent && (
                                    <Chip
                                      size="small"
                                      color="success"
                                      label={t('common.current')}
                                    />
                                  )}
                                  <Box
                                    sx={{
                                      ml: 'auto',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                    }}
                                  >
                                    {meso.startDate && meso.endDate && (
                                      <Chip
                                        size="small"
                                        variant="outlined"
                                        label={`${weeksBetween(meso.startDate, meso.endDate)} ${t('common.weeks')}`}
                                      />
                                    )}
                                    <Chip
                                      size="small"
                                      variant="outlined"
                                      label={`${micros.length} ${t('cycles.microcycle.title').toLowerCase()}`}
                                    />
                                  </Box>
                                </Box>
                                {meso.startDate && meso.endDate && (
                                  <Timeline
                                    start={meso.startDate}
                                    end={meso.endDate}
                                    segments={microSegments}
                                  />
                                )}
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<AddIcon />}
                                  onClick={() => openAddMicro(macro, meso)}
                                >
                                  {t('cycles.microcycle.add')}
                                </Button>
                                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                                  <Tooltip title={t('actions.edit')}>
                                    <IconButton
                                      size="small"
                                      onClick={() => openEditMeso(macro, meso)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t('actions.delete')}>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() =>
                                        setDeleteTarget({
                                          level: 'meso',
                                          id: meso.id,
                                          label:
                                            meso.name ||
                                            `${t('cycles.mesocycle.singular')} ${meso.number ?? meso.id}`,
                                        })
                                      }
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>

                              {micros.length === 0 ? (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontStyle: 'italic' }}
                                >
                                  {t('cycles.microcycle.description')}
                                </Typography>
                              ) : (
                                <Stack spacing={0.75}>
                                  {micros.map((micro, idx) => {
                                    const microCurrent = isCurrent(micro.startDate, micro.endDate);
                                    return (
                                      <Paper
                                        key={micro.id}
                                        variant="outlined"
                                        sx={{
                                          p: 1.25,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1.5,
                                          flexWrap: 'wrap',
                                          borderLeft: `4px solid ${SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}`,
                                          backgroundColor: microCurrent
                                            ? 'action.selected'
                                            : 'background.paper',
                                        }}
                                      >
                                        <Chip
                                          size="small"
                                          label={`#${micro.number ?? idx + 1}`}
                                          variant="outlined"
                                        />
                                        <Box sx={{ minWidth: 160, flex: '1 1 200px' }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {micro.name ||
                                              `${t('cycles.microcycle.singular')} ${micro.number ?? micro.id}`}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {formatDate(micro.startDate)} —{' '}
                                            {formatDate(micro.endDate)}
                                          </Typography>
                                        </Box>
                                        {microCurrent && (
                                          <Chip
                                            size="small"
                                            color="success"
                                            label={t('common.current')}
                                          />
                                        )}
                                        {micro.sessionGoals?.length ? (
                                          <Chip
                                            size="small"
                                            variant="outlined"
                                            label={`${micro.sessionGoals.length} ${t('common.sessions')}`}
                                          />
                                        ) : null}
                                        {micro.notes && (
                                          <Tooltip title={micro.notes}>
                                            <Chip
                                              size="small"
                                              variant="outlined"
                                              label={t('common.notes')}
                                            />
                                          </Tooltip>
                                        )}
                                        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.25 }}>
                                          <Tooltip title={t('actions.viewDetails')}>
                                            <IconButton
                                              size="small"
                                              color="info"
                                              onClick={() => openDetails(macro, meso, micro)}
                                            >
                                              <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title={t('actions.edit')}>
                                            <IconButton
                                              size="small"
                                              onClick={() => openEditMicro(micro)}
                                            >
                                              <EditIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title={t('actions.delete')}>
                                            <IconButton
                                              size="small"
                                              color="error"
                                              onClick={() =>
                                                setDeleteTarget({
                                                  level: 'micro',
                                                  id: micro.id,
                                                  label:
                                                    micro.name ||
                                                    `${t('cycles.microcycle.singular')} ${micro.number ?? micro.id}`,
                                                })
                                              }
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                      </Paper>
                                    );
                                  })}
                                </Stack>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        );
                      })}
                    </Stack>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      )}

      {/* Create / Edit Dialog */}
      <GuardedDialog
        open={dialogOpen}
        onClose={closeDialog}
        isDirty={isCycleFormDirty}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {form.level === 'macro' &&
            (form.id ? t('cycles.macrocycle.edit') : t('cycles.macrocycle.add'))}
          {form.level === 'meso' &&
            (form.id ? t('cycles.mesocycle.edit') : t('cycles.mesocycle.add'))}
          {form.level === 'micro' &&
            (form.id ? t('cycles.microcycle.edit') : t('cycles.microcycle.add'))}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {form.level === 'macro' && (
              <FormControl fullWidth required>
                <InputLabel>{t('team.singular')}</InputLabel>
                <Select
                  label={t('team.singular')}
                  value={form.teamId}
                  onChange={(e) => setForm((prev) => ({ ...prev, teamId: String(e.target.value) }))}
                >
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={String(team.id)}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {form.level !== 'macro' && (
              <FormControl fullWidth required>
                <InputLabel>{t('cycles.macrocycle.select')}</InputLabel>
                <Select
                  label={t('cycles.macrocycle.select')}
                  value={form.macrocycleId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      macrocycleId: String(e.target.value),
                      mesocycleId: '',
                    }))
                  }
                >
                  {macroCycles.map((m) => (
                    <MenuItem key={m.id} value={String(m.id)}>
                      {m.name || `${t('cycles.macrocycle.singular')} ${m.number ?? m.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {form.level === 'micro' && (
              <FormControl fullWidth required>
                <InputLabel>{t('cycles.mesocycle.select')}</InputLabel>
                <Select
                  label={t('cycles.mesocycle.select')}
                  value={form.mesocycleId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, mesocycleId: String(e.target.value) }))
                  }
                >
                  {(selectedMacro?.mesocycles ?? []).map((m) => (
                    <MenuItem key={m.id} value={String(m.id)}>
                      {m.name || `${t('cycles.mesocycle.singular')} ${m.number ?? m.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {form.level === 'micro' && (
              <TextField
                label={t('common.number')}
                type="number"
                value={form.number}
                onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
                fullWidth
              />
            )}

            <TextField
              label={t('common.name')}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />

            <TextField
              label={t('common.start')}
              type={form.level === 'macro' ? 'datetime-local' : 'date'}
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput:
                  form.level === 'meso' && selectedMacro
                    ? {
                        min: dayjs(selectedMacro.startDate).format('YYYY-MM-DD'),
                        max: dayjs(selectedMacro.endDate).format('YYYY-MM-DD'),
                      }
                    : form.level === 'micro' && selectedMeso
                      ? {
                          min: selectedMeso.startDate
                            ? dayjs(selectedMeso.startDate).format('YYYY-MM-DD')
                            : undefined,
                          max: selectedMeso.endDate
                            ? dayjs(selectedMeso.endDate).format('YYYY-MM-DD')
                            : undefined,
                        }
                      : undefined,
              }}
              fullWidth
              required
            />
            <TextField
              label={t('common.end')}
              type={form.level === 'macro' ? 'datetime-local' : 'date'}
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput:
                  form.level === 'meso' && selectedMacro
                    ? {
                        min: form.startDate || dayjs(selectedMacro.startDate).format('YYYY-MM-DD'),
                        max: dayjs(selectedMacro.endDate).format('YYYY-MM-DD'),
                      }
                    : form.level === 'micro' && selectedMeso
                      ? {
                          min:
                            form.startDate ||
                            (selectedMeso.startDate
                              ? dayjs(selectedMeso.startDate).format('YYYY-MM-DD')
                              : undefined),
                          max: selectedMeso.endDate
                            ? dayjs(selectedMeso.endDate).format('YYYY-MM-DD')
                            : undefined,
                        }
                      : undefined,
              }}
              fullWidth
              required
            />

            <TextField
              label={t('common.notes')}
              multiline
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              fullWidth
            />

            {saving && <LinearProgress />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>{t('actions.delete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget
              ? t(
                  `cycles.${deleteTarget.level === 'macro' ? 'macrocycle' : deleteTarget.level === 'meso' ? 'mesocycle' : 'microcycle'}.delete.confirm`,
                  { id: deleteTarget.label }
                )
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>{t('actions.cancel')}</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <MicrocycleDetailsDialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setDetailsData(null);
          setDetailsMacro(null);
          setDetailsMeso(null);
        }}
        data={detailsData}
        macrocycle={detailsMacro}
        mesocycle={detailsMeso}
      />
    </PageContainer>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number }> = ({
  icon,
  label,
  value,
}) => (
  <Paper variant="outlined" sx={{ p: 2, flex: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  </Paper>
);

export default CyclesPage;
