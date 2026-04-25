'use client';

import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import dayjs, { Dayjs } from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt';
import 'dayjs/locale/en';

import PageContainer from '@/app/components/container/PageContainer';
import PracticeItemsList from './components/PracticeItemsList';
import CopyPracticeDialog from './components/CopyPracticeDialog';
import AttendanceTable, { AttendanceRow } from './components/AttendanceTable';
import PracticeGroupsBuilder from './components/PracticeGroupsBuilder';
import PracticeCycleSummary from './components/PracticeCycleSummary';
import { useTeams } from '@/hooks/useTeams';
import {
  usePractices,
  useSavePractice,
  useDeletePractice,
  usePracticeSettings,
  useUpdatePracticeSettings,
} from '@/hooks/usePractices';
import type {
  AttendanceDefault,
  PracticeGroupsInterface,
  PracticeInterface,
} from '@/types/practices/types';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

dayjs.extend(localizedFormat);

type Gender = 'MALE' | 'FEMALE' | 'COED';

interface PracticeFormState {
  id: number | null;
  teamId: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  topic: string;
  offensiveGoals: string;
  defensiveGoals: string;
  notes: string;
  completed: boolean;
  attendance: Record<number, boolean>;
  attendanceDetails: Record<
    number,
    {
      attended: boolean | null;
      lateMinutes: number | null;
      absenceReasonId: number | null;
      absenceNotes: string;
    }
  >;
  groups: PracticeGroupsInterface | null;
}

const EMPTY_FORM: PracticeFormState = {
  id: null,
  teamId: '',
  subtitle: '',
  date: dayjs().format('YYYY-MM-DD'),
  startTime: '18:00',
  endTime: '19:30',
  topic: '',
  offensiveGoals: '',
  defensiveGoals: '',
  notes: '',
  completed: false,
  attendance: {},
  attendanceDetails: {},
  groups: null,
};

function buildDateTime(date: string, time: string): string {
  return dayjs(`${date}T${time}`).toISOString();
}

function getMonthGrid(base: Dayjs): Dayjs[] {
  const startOfMonth = base.startOf('month');
  const gridStart = startOfMonth.startOf('week');
  const cells: Dayjs[] = [];
  for (let i = 0; i < 42; i++) cells.push(gridStart.add(i, 'day'));
  return cells;
}

const PracticesPage = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const [snack, setSnack] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>({ open: false, severity: 'success', message: '' });

  const showMessage = (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning' = 'success'
  ): void => setSnack({ open: true, severity, message });

  const locale = i18n.language?.startsWith('en') ? 'en' : 'pt';
  dayjs.locale(locale);

  const [cursor, setCursor] = useState<Dayjs>(dayjs());
  const [filterTeamId, setFilterTeamId] = useState<string>('all');

  const monthStart = cursor.startOf('month').subtract(7, 'day');
  const monthEnd = cursor.endOf('month').add(7, 'day');

  const teamsQuery = useTeams();
  const practicesQuery = usePractices({
    from: monthStart.toISOString(),
    to: monthEnd.toISOString(),
    teamId: filterTeamId === 'all' ? null : Number(filterTeamId),
  });
  const settingsQuery = usePracticeSettings();
  const savePractice = useSavePractice();
  const deletePractice = useDeletePractice();
  const updateSettings = useUpdatePracticeSettings();

  const teams = teamsQuery.data ?? [];
  const practices = practicesQuery.data ?? [];

  const practicesByDay = useMemo(() => {
    const map = new Map<string, PracticeInterface[]>();
    for (const p of practices) {
      const key = dayjs(p.date).format('YYYY-MM-DD');
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    for (const [, arr] of map)
      arr.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
    return map;
  }, [practices]);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<PracticeFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<PracticeInterface | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copySource, setCopySource] = useState<PracticeInterface | null>(null);

  // The practice form is the largest in the app (cycle/notes, attendance,
  // groups, ...). The snapshot guard catches every kind of edit transparently
  // because the whole form lives inside `form`.
  const isPracticeFormDirty = useFormSnapshotDirty(formOpen, form);

  const selectedTeam = useMemo(
    () => teams.find((tm) => tm.id === Number(form.teamId)) ?? null,
    [teams, form.teamId]
  );

  const teamAthletes = useMemo(() => {
    if (!selectedTeam) return [];
    return (selectedTeam.athletes ?? [])
      .map((ta) => ta.athlete)
      .filter((a) => a && a.id != null)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [selectedTeam]);

  const genderDefault = (gender?: Gender | null): AttendanceDefault => {
    const s = settingsQuery.data;
    if (!s) return 'ALL';
    if (gender === 'MALE') return s.defaultAttendanceMale;
    if (gender === 'FEMALE') return s.defaultAttendanceFemale;
    return s.defaultAttendanceCoed;
  };

  const openCreate = (date?: Dayjs): void => {
    const defaultDate = (date ?? dayjs()).format('YYYY-MM-DD');
    const defaultTeam = filterTeamId !== 'all' ? filterTeamId : '';
    let attendance: Record<number, boolean> = {};
    if (defaultTeam) {
      const tm = teams.find((x) => x.id === Number(defaultTeam));
      const gender = tm?.echelon?.gender as Gender | undefined;
      const def = genderDefault(gender ?? null);
      attendance = Object.fromEntries(
        (tm?.athletes ?? [])
          .map((ta) => ta.athlete)
          .filter((a) => a && a.id != null)
          .map((a) => [a.id as number, def === 'ALL'])
      );
    }
    setForm({
      ...EMPTY_FORM,
      teamId: defaultTeam,
      date: defaultDate,
      attendance,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (practice: PracticeInterface): void => {
    const start = dayjs(practice.date);
    const end = dayjs(practice.endTime);
    const attendance: Record<number, boolean> = {};
    const attendanceDetails: PracticeFormState['attendanceDetails'] = {};
    for (const att of practice.attendances ?? []) {
      if (att.athleteId != null) {
        attendance[att.athleteId] = att.attending;
        attendanceDetails[att.athleteId] = {
          attended: att.attended ?? null,
          lateMinutes: att.lateMinutes ?? null,
          absenceReasonId: att.absenceReasonId ?? null,
          absenceNotes: att.absenceNotes ?? '',
        };
      }
    }
    setForm({
      id: practice.id,
      teamId: String(practice.teamId ?? ''),
      subtitle: practice.subtitle ?? '',
      date: start.format('YYYY-MM-DD'),
      startTime: start.format('HH:mm'),
      endTime: end.format('HH:mm'),
      topic: practice.topic ?? '',
      offensiveGoals: practice.offensiveGoals ?? '',
      defensiveGoals: practice.defensiveGoals ?? '',
      notes: practice.notes ?? '',
      completed: practice.completed,
      attendance,
      attendanceDetails,
      groups: practice.groups ?? null,
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleTeamChange = (value: string): void => {
    setForm((prev) => {
      const tm = teams.find((x) => x.id === Number(value));
      const gender = tm?.echelon?.gender as Gender | undefined;
      const def = genderDefault(gender ?? null);
      const attendance: Record<number, boolean> = Object.fromEntries(
        (tm?.athletes ?? [])
          .map((ta) => ta.athlete)
          .filter((a) => a && a.id != null)
          .map((a) => {
            const existing = prev.attendance[a.id as number];
            return [a.id as number, existing ?? def === 'ALL'];
          })
      );
      return { ...prev, teamId: value, attendance };
    });
  };

  const toggleAllAttendance = (value: boolean): void => {
    setForm((prev) => ({
      ...prev,
      attendance: Object.fromEntries(teamAthletes.map((a) => [a.id as number, value])),
    }));
  };

  const handleSave = async (): Promise<void> => {
    setFormError(null);
    if (!form.teamId) {
      setFormError(t('practice.validation.teamRequired'));
      return;
    }
    if (!form.date) {
      setFormError(t('practice.validation.dateRequired'));
      return;
    }
    if (!form.topic.trim()) {
      setFormError(t('practice.validation.topicRequired'));
      return;
    }
    const startIso = buildDateTime(form.date, form.startTime);
    const endIso = buildDateTime(form.date, form.endTime);
    if (dayjs(endIso).isBefore(dayjs(startIso))) {
      setFormError(t('practice.validation.endBeforeStart'));
      return;
    }
    const athletes = Object.entries(form.attendance).map(([athleteId, attending]) => {
      const id = Number(athleteId);
      const details = form.attendanceDetails[id];
      return {
        athleteId: id,
        attending,
        attended: details?.attended ?? null,
        lateMinutes: details?.lateMinutes ?? null,
        absenceReasonId: details?.absenceReasonId ?? null,
        absenceNotes: details?.absenceNotes ?? null,
      };
    });

    try {
      await savePractice.mutateAsync({
        id: form.id ?? undefined,
        teamId: Number(form.teamId),
        date: startIso,
        endTime: endIso,
        subtitle: form.subtitle || null,
        topic: form.topic.trim(),
        offensiveGoals: form.offensiveGoals || null,
        defensiveGoals: form.defensiveGoals || null,
        notes: form.notes || null,
        completed: form.completed,
        athletes,
        groups: form.groups,
      });
      setFormOpen(false);
      showMessage(
        form.id ? t('practice.save.updateSuccess') : t('practice.save.createSuccess'),
        'success'
      );
    } catch (err) {
      const msg = (err as Error)?.message || t('practice.save.error');
      setFormError(msg);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!confirmDelete) return;
    try {
      await deletePractice.mutateAsync(confirmDelete.id);
      setConfirmDelete(null);
      showMessage(t('practice.delete.success'), 'success');
    } catch (err) {
      showMessage((err as Error)?.message || t('practice.delete.error'), 'error');
    }
  };

  const monthCells = useMemo(() => getMonthGrid(cursor), [cursor]);

  const weekdayLabels = useMemo(() => {
    const base = dayjs().startOf('week');
    return Array.from({ length: 7 }, (_, i) => base.add(i, 'day').format('ddd'));
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Rows fed into <AttendanceTable>. Built from the currently-selected
   * team's roster so the coach sees every athlete (even those not yet
   * flagged as "Has to attend"). */
  const attendanceRows = useMemo<AttendanceRow[]>(
    () =>
      teamAthletes
        .filter((a) => a.id != null)
        .map((a) => {
          const id = a.id as number;
          const details = form.attendanceDetails[id];
          return {
            athleteId: id,
            name: a.name || '',
            number: a.number ?? null,
            photo: a.photo ?? null,
            hasToAttend: !!form.attendance[id],
            attended: details?.attended ?? null,
            lateMinutes: details?.lateMinutes ?? null,
            absenceReasonId: details?.absenceReasonId ?? null,
            absenceNotes: details?.absenceNotes ?? '',
          };
        }),
    [teamAthletes, form.attendance, form.attendanceDetails]
  );

  const handleGroupsChange = useCallback((groups: PracticeGroupsInterface | null): void => {
    setForm((prev) => (prev.groups === groups ? prev : { ...prev, groups }));
  }, []);

  const groupAthletes = useMemo(
    () =>
      teamAthletes
        .filter((a) => a.id != null)
        .map((a) => ({ id: a.id as number, name: a.name || '' })),
    [teamAthletes]
  );

  const handleAttendanceRowChange = (athleteId: number, patch: Partial<AttendanceRow>): void => {
    setForm((prev) => {
      const nextAttendance = { ...prev.attendance };
      if (patch.hasToAttend !== undefined) {
        nextAttendance[athleteId] = patch.hasToAttend;
      }
      const current = prev.attendanceDetails[athleteId] ?? {
        attended: null,
        lateMinutes: null,
        absenceReasonId: null,
        absenceNotes: '',
      };
      const nextDetail = {
        attended: patch.attended !== undefined ? patch.attended : current.attended,
        lateMinutes: patch.lateMinutes !== undefined ? patch.lateMinutes : current.lateMinutes,
        absenceReasonId:
          patch.absenceReasonId !== undefined ? patch.absenceReasonId : current.absenceReasonId,
        absenceNotes: patch.absenceNotes !== undefined ? patch.absenceNotes : current.absenceNotes,
      };
      return {
        ...prev,
        attendance: nextAttendance,
        attendanceDetails: {
          ...prev.attendanceDetails,
          [athleteId]: nextDetail,
        },
      };
    });
  };

  return (
    <PageContainer title={t('practice.title')} description={t('practice.description')}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('practice.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('practice.description')}
            </Typography>
          </Box>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>{t('team.singular')}</InputLabel>
              <Select
                label={t('team.singular')}
                value={filterTeamId}
                onChange={(e) => setFilterTeamId(String(e.target.value))}
              >
                <MenuItem value="all">{t('common.all')}</MenuItem>
                {teams.map((tm) =>
                  tm.id != null ? (
                    <MenuItem key={tm.id} value={String(tm.id)}>
                      {tm.name}
                      {tm.echelon?.name ? ` · ${tm.echelon.name}` : ''}
                    </MenuItem>
                  ) : null
                )}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsOpen(true)}
            >
              {t('practice.settings.button')}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate(dayjs())}>
              {t('practice.add')}
            </Button>
          </Stack>
        </Stack>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
          >
            <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
              <IconButton onClick={() => setCursor(cursor.subtract(1, 'month'))}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: 220, textAlign: 'center' }}>
                {cursor.format('MMMM YYYY')}
              </Typography>
              <IconButton onClick={() => setCursor(cursor.add(1, 'month'))}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
            <Button size="small" startIcon={<TodayIcon />} onClick={() => setCursor(dayjs())}>
              {t('common.today')}
            </Button>
          </Stack>

          {practicesQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 1,
              }}
            >
              {weekdayLabels.map((label, idx) => (
                <Box
                  key={`wd-${idx}`}
                  sx={{
                    textAlign: 'center',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    color: 'text.secondary',
                    fontSize: 13,
                    pb: 1,
                  }}
                >
                  {label}
                </Box>
              ))}
              {monthCells.map((cell) => {
                const key = cell.format('YYYY-MM-DD');
                const dayPractices = practicesByDay.get(key) ?? [];
                const isCurrentMonth = cell.month() === cursor.month();
                const isToday = cell.isSame(dayjs(), 'day');
                return (
                  <Paper
                    key={key}
                    elevation={0}
                    sx={{
                      minHeight: 120,
                      p: 1,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isToday ? theme.palette.primary.main : 'divider',
                      backgroundColor: isCurrentMonth ? 'background.paper' : 'action.hover',
                      opacity: isCurrentMonth ? 1 : 0.55,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s',
                      '&:hover': {
                        borderColor: theme.palette.primary.light,
                      },
                    }}
                    onClick={() => openCreate(cell)}
                  >
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {cell.format('D')}
                      </Typography>
                      {dayPractices.length > 0 ? (
                        <Chip
                          size="small"
                          label={dayPractices.length}
                          color="primary"
                          sx={{ height: 18, fontSize: 11 }}
                        />
                      ) : null}
                    </Stack>
                    <Stack sx={{ gap: 0.5, overflow: 'hidden' }}>
                      {dayPractices.slice(0, 3).map((p) => (
                        <Tooltip key={p.id} title={`${p.team?.name ?? ''} · ${p.topic}`} arrow>
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(p);
                            }}
                            sx={{
                              position: 'relative',
                              pl: 0.75,
                              pr: 4,
                              py: 0.25,
                              borderRadius: 1,
                              backgroundColor: p.completed ? 'success.light' : 'primary.light',
                              color: 'primary.contrastText',
                              fontSize: 11,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              cursor: 'pointer',
                              '&:hover': { filter: 'brightness(0.95)' },
                              '&:hover .practice-chip-actions': { opacity: 1 },
                            }}
                          >
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ fontWeight: 600, mr: 0.5 }}
                            >
                              {dayjs(p.date).format('HH:mm')}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {p.team?.name ?? t('practice.title')}
                            </Typography>
                            <Box
                              className="practice-chip-actions"
                              sx={{
                                position: 'absolute',
                                right: 2,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.25,
                                opacity: 0,
                                transition: 'opacity 0.15s',
                              }}
                            >
                              <IconButton
                                size="small"
                                sx={{
                                  width: 16,
                                  height: 16,
                                  color: 'inherit',
                                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCopySource(p);
                                }}
                                aria-label={t('practice.copy.button')}
                              >
                                <ContentCopyIcon sx={{ fontSize: 12 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                sx={{
                                  width: 16,
                                  height: 16,
                                  color: 'inherit',
                                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.25)' },
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDelete(p);
                                }}
                                aria-label={t('actions.delete')}
                              >
                                <CloseIcon sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Tooltip>
                      ))}
                      {dayPractices.length > 3 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                          +{dayPractices.length - 3}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Practice Form Dialog */}
      <GuardedDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        isDirty={isPracticeFormDirty}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>{form.id ? t('practice.edit') : t('practice.add')}</DialogTitle>
        <DialogContent dividers>
          {formError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          ) : null}
          <Stack sx={{ gap: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>{t('team.singular')}</InputLabel>
                <Select
                  label={t('team.singular')}
                  value={form.teamId}
                  onChange={(e) => handleTeamChange(String(e.target.value))}
                >
                  {teams.map((tm) =>
                    tm.id != null ? (
                      <MenuItem key={tm.id} value={String(tm.id)}>
                        {tm.name}
                        {tm.echelon?.name ? ` · ${tm.echelon.name}` : ''}
                      </MenuItem>
                    ) : null
                  )}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label={t('practice.subtitle')}
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
              <TextField
                fullWidth
                type="date"
                label={t('common.date')}
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                type="time"
                label={t('practice.startTime')}
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                type="time"
                label={t('practice.endTime')}
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>

            {/* Cycle context for the selected team + date so the coach
             * sees the macro / meso / micro and their notes before
             * touching the rest of the form. */}
            <PracticeCycleSummary
              teamId={form.teamId ? Number(form.teamId) : null}
              date={form.date}
            />

            <TextField
              label={t('practice.topic')}
              required
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              fullWidth
            />

            <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
              <TextField
                fullWidth
                label={t('practice.offensiveGoals')}
                value={form.offensiveGoals}
                onChange={(e) => setForm({ ...form, offensiveGoals: e.target.value })}
              />
              <TextField
                fullWidth
                label={t('practice.defensiveGoals')}
                value={form.defensiveGoals}
                onChange={(e) => setForm({ ...form, defensiveGoals: e.target.value })}
              />
            </Stack>

            <TextField
              label={t('practice.notes')}
              multiline
              minRows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.completed}
                  onChange={(e) => setForm({ ...form, completed: e.target.checked })}
                />
              }
              label={t('practice.completed')}
            />

            <Divider />

            {form.id ? (
              <>
                <PracticeItemsList
                  practiceId={form.id}
                  items={practices.find((x) => x.id === form.id)?.items ?? []}
                  startTime={buildDateTime(form.date, form.startTime)}
                  endTime={buildDateTime(form.date, form.endTime)}
                  onChangedMessage={(message, severity) =>
                    setSnack({ open: true, severity, message })
                  }
                />
              </>
            ) : (
              <Alert severity="info" icon={false} sx={{ mt: 1 }}>
                {t('practice.items.availableAfterSave')}
              </Alert>
            )}

            <Divider />

            {/* Athletes attendance and groups */}
            {form.teamId === '' ? (
              <Alert severity="info">{t('practice.attendance.selectTeamFirst')}</Alert>
            ) : teamAthletes.length === 0 ? (
              <Alert severity="warning">{t('practice.attendance.noAthletes')}</Alert>
            ) : (
              <Stack sx={{ gap: 1.5 }}>
                <AttendanceTable
                  rows={attendanceRows}
                  onChange={handleAttendanceRowChange}
                  onToggleAll={toggleAllAttendance}
                  showPresenceColumns={!!form.id}
                />
                <PracticeGroupsBuilder
                  athletes={groupAthletes}
                  value={form.groups}
                  onChange={handleGroupsChange}
                  hint={form.id ? undefined : t('practice.groups.hintUnsaved')}
                />
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {form.id ? (
            <>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  const p = practices.find((x) => x.id === form.id);
                  if (p) setConfirmDelete(p);
                  setFormOpen(false);
                }}
              >
                {t('actions.delete')}
              </Button>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={() => {
                  const p = practices.find((x) => x.id === form.id);
                  if (p) {
                    setFormOpen(false);
                    setCopySource(p);
                  }
                }}
              >
                {t('practice.copy.button')}
              </Button>
            </>
          ) : null}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setFormOpen(false)}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSave} disabled={savePractice.isPending}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>{t('practice.delete.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('practice.delete.confirm', {
              date: confirmDelete ? dayjs(confirmDelete.date).format('LLL') : '',
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>{t('actions.cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deletePractice.isPending}
          >
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        value={settingsQuery.data ?? null}
        onSave={async (payload) => {
          try {
            await updateSettings.mutateAsync(payload);
            showMessage(t('practice.settings.saveSuccess'), 'success');
            setSettingsOpen(false);
          } catch (err) {
            showMessage((err as Error)?.message || t('practice.settings.saveError'), 'error');
          }
        }}
        saving={updateSettings.isPending}
      />

      {/* Copy practice dialog */}
      <CopyPracticeDialog
        open={!!copySource}
        source={copySource}
        onClose={() => setCopySource(null)}
        onDone={(message, severity) => setSnack({ open: true, severity, message })}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  value: {
    defaultAttendanceMale: AttendanceDefault;
    defaultAttendanceFemale: AttendanceDefault;
    defaultAttendanceCoed: AttendanceDefault;
  } | null;
  onSave: (payload: {
    defaultAttendanceMale: AttendanceDefault;
    defaultAttendanceFemale: AttendanceDefault;
    defaultAttendanceCoed: AttendanceDefault;
  }) => void;
  saving: boolean;
}

const SettingsDialog = ({
  open,
  onClose,
  value,
  onSave,
  saving,
}: SettingsDialogProps): ReactElement => {
  const { t } = useTranslation();
  const [male, setMale] = useState<AttendanceDefault>('ALL');
  const [female, setFemale] = useState<AttendanceDefault>('ALL');
  const [coed, setCoed] = useState<AttendanceDefault>('ALL');

  React.useEffect(() => {
    if (value) {
      setMale(value.defaultAttendanceMale);
      setFemale(value.defaultAttendanceFemale);
      setCoed(value.defaultAttendanceCoed);
    }
  }, [value, open]);

  const isSettingsDirty = useFormSnapshotDirty(open, { male, female, coed });

  const renderToggle = (
    label: string,
    val: AttendanceDefault,
    setter: (v: AttendanceDefault) => void
  ): ReactElement => (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={val}
        onChange={(_, v: AttendanceDefault | null) => v && setter(v)}
      >
        <ToggleButton value="ALL">{t('practice.settings.defaultAll')}</ToggleButton>
        <ToggleButton value="NONE">{t('practice.settings.defaultNone')}</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );

  return (
    <GuardedDialog open={open} onClose={onClose} isDirty={isSettingsDirty} maxWidth="sm" fullWidth>
      <DialogTitle>{t('practice.settings.title')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('practice.settings.description')}
        </Typography>
        {renderToggle(t('gender.male'), male, setMale)}
        <Divider />
        {renderToggle(t('gender.female'), female, setFemale)}
        <Divider />
        {renderToggle(t('practice.settings.coed'), coed, setCoed)}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.cancel')}</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() =>
            onSave({
              defaultAttendanceMale: male,
              defaultAttendanceFemale: female,
              defaultAttendanceCoed: coed,
            })
          }
        >
          {t('actions.save')}
        </Button>
      </DialogActions>
    </GuardedDialog>
  );
};

export default PracticesPage;
