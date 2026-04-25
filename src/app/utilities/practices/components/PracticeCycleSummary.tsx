'use client';

import React, { ReactElement, useMemo } from 'react';
import { Alert, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import dayjs from 'dayjs';

import { useMacrocycles, useMicrocycles } from '@/hooks/useCycles';
import type {
  MacrocycleInterface,
  MesocycleInterface,
  MicrocycleInterface,
} from '@/types/cycles/types';

interface Props {
  /** ID of the team currently selected on the practice form. `null`
   * means the coach has not picked one yet. */
  teamId: number | null;
  /** ISO date / datetime of the practice — used to find the active
   * macro / meso / micro that contains it. */
  date: string;
}

function inRange(d: dayjs.Dayjs, start?: Date | string, end?: Date | string): boolean {
  if (!start || !end) return false;
  const s = dayjs(start).startOf('day');
  const e = dayjs(end).endOf('day');
  return (d.isSame(s) || d.isAfter(s)) && (d.isSame(e) || d.isBefore(e));
}

function describe(label: string, number?: number | null, name?: string | null): string {
  const parts: string[] = [];
  if (number != null) parts.push(`#${number}`);
  if (name) parts.push(name);
  return parts.length > 0 ? `${label} ${parts.join(' · ')}` : label;
}

/** Compact, read-only summary of the current macro/meso/microcycle for
 * the practice's team and date. Helps coaches quickly recall the
 * planning context the moment they open a session. */
export default function PracticeCycleSummary({ teamId, date }: Props): ReactElement {
  const { t } = useTranslation();
  const macrosQuery = useMacrocycles();
  const microsQuery = useMicrocycles();
  const isLoading = macrosQuery.isLoading || microsQuery.isLoading;

  const target = useMemo(() => dayjs(date), [date]);

  const active = useMemo(() => {
    if (!teamId) return null;
    const macros = macrosQuery.data ?? [];
    const micros = microsQuery.data ?? [];

    const macro: MacrocycleInterface | undefined = macros.find(
      (m) => m.teamId === teamId && inRange(target, m.startDate, m.endDate)
    );

    /* Find a microcycle that (a) belongs (transitively) to a macrocycle
     * of this team and (b) covers the target date. */
    const micro: MicrocycleInterface | undefined = micros.find(
      (mc) =>
        mc.mesocycle?.macrocycle?.teamId === teamId && inRange(target, mc.startDate, mc.endDate)
    );

    let meso: MesocycleInterface | undefined = micro?.mesocycle;
    if (!meso && macro) {
      meso = macro.mesocycles.find((ms) => inRange(target, ms.startDate, ms.endDate));
    }

    /* If the macro lookup failed, fall back to the macro nested under
     * the matched microcycle (handy when the macro range is slightly
     * narrower than its child cycles). */
    const resolvedMacro = macro ?? micro?.mesocycle?.macrocycle ?? null;

    return { macro: resolvedMacro, meso: meso ?? null, micro: micro ?? null };
  }, [macrosQuery.data, microsQuery.data, target, teamId]);

  if (!teamId) {
    return (
      <Alert
        icon={<EventNoteIcon fontSize="small" />}
        severity="info"
        variant="outlined"
        sx={{ py: 0.5 }}
      >
        {t('practice.cycleSummary.selectTeamFirst')}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            {t('practice.cycleSummary.title')}
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (!active || (!active.macro && !active.meso && !active.micro)) {
    return (
      <Alert
        icon={<EventNoteIcon fontSize="small" />}
        severity="warning"
        variant="outlined"
        sx={{ py: 0.5 }}
      >
        {t('practice.cycleSummary.noActive')}
      </Alert>
    );
  }

  const { macro, meso, micro } = active;
  const dateRange = (start?: Date | string, end?: Date | string): string =>
    start && end
      ? t('practice.cycleSummary.dateRange', {
          start: dayjs(start).format('DD/MM'),
          end: dayjs(end).format('DD/MM/YYYY'),
        })
      : '';

  return (
    <Paper
      variant="outlined"
      sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'background.default' }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
        <EventNoteIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {t('practice.cycleSummary.title')}
        </Typography>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 1.5, alignItems: 'stretch' }}>
        {macro ? (
          <CycleCard
            label={t('practice.cycleSummary.macrocycle')}
            heading={describe('', macro.number ?? null, macro.name ?? null)}
            range={dateRange(macro.startDate, macro.endDate)}
            notes={macro.notes ?? null}
            color="#2563eb"
            noNotesLabel={t('practice.cycleSummary.noNotes')}
          />
        ) : null}
        {meso ? (
          <CycleCard
            label={t('practice.cycleSummary.mesocycle')}
            heading={describe('', meso.number ?? null, meso.name ?? null)}
            range={dateRange(meso.startDate, meso.endDate)}
            notes={meso.notes ?? null}
            color="#7c3aed"
            noNotesLabel={t('practice.cycleSummary.noNotes')}
          />
        ) : null}
        {micro ? (
          <CycleCard
            label={t('practice.cycleSummary.microcycle')}
            heading={describe('', micro.number ?? null, micro.name ?? null)}
            range={dateRange(micro.startDate, micro.endDate)}
            notes={micro.notes ?? null}
            color="#059669"
            noNotesLabel={t('practice.cycleSummary.noNotes')}
          />
        ) : null}
      </Stack>
    </Paper>
  );
}

interface CycleCardProps {
  label: string;
  heading: string;
  range: string;
  notes: string | null;
  color: string;
  noNotesLabel: string;
}

function CycleCard({
  label,
  heading,
  range,
  notes,
  color,
  noNotesLabel,
}: CycleCardProps): ReactElement {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 220,
        p: 1.25,
        borderLeft: '4px solid',
        borderLeftColor: color,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
        <Chip
          size="small"
          label={label}
          sx={{
            backgroundColor: color,
            color: 'white',
            fontSize: 11,
            height: 20,
            fontWeight: 600,
          }}
        />
        {heading.trim() ? (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {heading}
          </Typography>
        ) : null}
        {range ? (
          <Typography variant="caption" color="text.secondary">
            {range}
          </Typography>
        ) : null}
      </Stack>
      <Typography
        variant="body2"
        sx={{
          color: notes ? 'text.primary' : 'text.disabled',
          whiteSpace: 'pre-wrap',
          fontStyle: notes ? 'normal' : 'italic',
        }}
      >
        {notes || noNotesLabel}
      </Typography>
    </Paper>
  );
}
