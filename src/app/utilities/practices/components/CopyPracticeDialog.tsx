'use client';

import React, { ReactElement, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import dayjs from 'dayjs';
import type { PracticeInterface } from '@/types/practices/types';
import { useDuplicatePractice } from '@/hooks/usePractices';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

interface Props {
  open: boolean;
  source: PracticeInterface | null;
  onClose: () => void;
  onDone?: (message: string, severity: 'success' | 'error') => void;
}

const CopyPracticeDialog = ({ open, source, onClose, onDone }: Props): ReactElement => {
  const { t } = useTranslation();
  const duplicate = useDuplicatePractice();

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [copyItems, setCopyItems] = useState(true);
  const [copyAttendance, setCopyAttendance] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !source) return;
    const src = dayjs(source.date);
    const srcEnd = dayjs(source.endTime);
    setDate(src.add(7, 'day').format('YYYY-MM-DD'));
    setStartTime(src.format('HH:mm'));
    setEndTime(srcEnd.format('HH:mm'));
    setCopyItems(true);
    setCopyAttendance(true);
    setError(null);
  }, [open, source]);

  const handleConfirm = async (): Promise<void> => {
    setError(null);
    if (!source) return;
    if (!date) {
      setError(t('practice.validation.dateRequired'));
      return;
    }
    const startIso = dayjs(`${date}T${startTime}`).toISOString();
    const endIso = dayjs(`${date}T${endTime}`).toISOString();
    if (dayjs(endIso).isBefore(dayjs(startIso))) {
      setError(t('practice.validation.endBeforeStart'));
      return;
    }
    try {
      await duplicate.mutateAsync({
        sourceId: source.id,
        date: startIso,
        endTime: endIso,
        copyItems,
        copyAttendance,
      });
      onDone?.(t('practice.copy.success'), 'success');
      onClose();
    } catch (e) {
      const msg = (e as Error)?.message || t('practice.copy.error');
      setError(msg);
      onDone?.(msg, 'error');
    }
  };

  const isDirty = useFormSnapshotDirty(open, {
    date,
    startTime,
    endTime,
    copyItems,
    copyAttendance,
  });

  return (
    <GuardedDialog open={open} onClose={onClose} isDirty={isDirty} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ContentCopyIcon fontSize="small" />
        {t('practice.copy.title')}
      </DialogTitle>
      <DialogContent dividers>
        {source ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('practice.copy.sourceInfo', {
              team: source.team?.name ?? '',
              date: dayjs(source.date).format('LLL'),
            })}
          </Typography>
        ) : null}
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Stack sx={{ gap: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} sx={{ gap: 2 }}>
            <TextField
              fullWidth
              type="date"
              label={t('common.date')}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="time"
              label={t('practice.startTime')}
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="time"
              label={t('practice.endTime')}
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <FormControlLabel
            control={
              <Switch checked={copyItems} onChange={(e) => setCopyItems(e.target.checked)} />
            }
            label={t('practice.copy.copyItems')}
          />
          <FormControlLabel
            control={
              <Switch
                checked={copyAttendance}
                onChange={(e) => setCopyAttendance(e.target.checked)}
              />
            }
            label={t('practice.copy.copyAttendance')}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.cancel')}</Button>
        <Button
          variant="contained"
          startIcon={<ContentCopyIcon />}
          onClick={handleConfirm}
          disabled={duplicate.isPending}
        >
          {t('practice.copy.confirm')}
        </Button>
      </DialogActions>
    </GuardedDialog>
  );
};

export default CopyPracticeDialog;
