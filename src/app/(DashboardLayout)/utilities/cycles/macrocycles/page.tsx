'use client';

import React, { ReactElement } from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Box,
} from '@mui/material';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt';
import 'dayjs/locale/en';
import { MacrocycleInterface } from '@/types/cycles/types';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

dayjs.extend(localizedFormat);

const MacroCyclesList = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const [macroCycles, setMacroCycles] = useState<MacrocycleInterface[]>([]);
  const { message: error, setTimedMessage: setError } = useMessage(5000);
  const { message: success, setTimedMessage: setSuccess } = useMessage(5000);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMacrocycle, setSelectedMacrocycle] = useState<MacrocycleInterface | null>(null);
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const currentLocale = i18n.language?.startsWith('pt') ? 'pt' : 'en';
  const formatDate = (date: Date): string => dayjs(date).locale(currentLocale).format('L');

  useEffect(() => {
    fetchMacroCycles();
  }, [setError]);

  const fetchMacroCycles = async (): Promise<void> => {
    try {
      const response = await fetch('/api/cycles/macrocycles');
      const data: MacrocycleInterface[] = await response.json();
      setMacroCycles(data);
    } catch (err) {
      log.error('Error fetching macro cycles:', err);
      setError(t('macrocycleFetchFailed'));
    }
  };

  const openAddOverlay = async (): Promise<void> => {
    const lastMacrocycle = [...macroCycles].sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    )[0];

    let baseStartDate = lastMacrocycle ? dayjs(lastMacrocycle.endDate) : null;

    // When creating the first macrocycle, start at current season start date.
    if (!baseStartDate) {
      try {
        const response = await fetch('/api/seasons/current');
        if (response.ok) {
          const season = await response.json();
          if (season?.startDate) {
            baseStartDate = dayjs(season.startDate);
          }
        }
      } catch (err) {
        log.error('Error fetching current season for first macrocycle:', err);
      }
    }

    const defaultStartDate = baseStartDate ? baseStartDate.format('YYYY-MM-DDTHH:mm') : '';
    const defaultEndDate = baseStartDate
      ? baseStartDate.add(1, 'month').format('YYYY-MM-DDTHH:mm')
      : '';

    setSelectedMacrocycle(null);
    setForm({
      name: '',
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      notes: '',
    });
    setDialogOpen(true);
  };

  const openEditOverlay = (cycle: MacrocycleInterface): void => {
    setSelectedMacrocycle(cycle);
    setForm({
      name: cycle.name || '',
      startDate: dayjs(cycle.startDate).format('YYYY-MM-DDTHH:mm'),
      endDate: dayjs(cycle.endDate).format('YYYY-MM-DDTHH:mm'),
      notes: cycle.notes || '',
    });
    setDialogOpen(true);
  };

  const closeOverlay = (): void => {
    setDialogOpen(false);
    setSelectedMacrocycle(null);
  };

  const handleSave = async (): Promise<void> => {
    if (!form.startDate || !form.endDate) {
      setError(t('macrocycleDatesRequired'));
      return;
    }

    try {
      const isEditing = Boolean(selectedMacrocycle?.id);
      const response = await fetch(
        isEditing ? `/api/cycles/macrocycles/${selectedMacrocycle?.id}` : '/api/cycles/macrocycles',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(isEditing ? { id: selectedMacrocycle?.id } : {}),
            name: form.name,
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
            notes: form.notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(t('macrocycleSaveFailed'));
      }

      setSuccess(isEditing ? t('macrocycleUpdatedSuccess') : t('macrocycleCreatedSuccess'));
      closeOverlay();
      await fetchMacroCycles();
    } catch (err) {
      log.error('Error saving macro cycle:', err);
      setError(t('macrocycleSaveFailed'));
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    const confirmed = window.confirm(t('macrocycleDeleteConfirm', { id }));
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cycles/macrocycles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess(t('macrocycleDeletedSuccess', { id }));
        setMacroCycles((prevCycles) => prevCycles.filter((cycle) => cycle.id !== id));
      } else {
        setError(t('macrocycleDeleteFailed'));
      }
    } catch (err) {
      log.error('Error deleting macro cycle:', err);
      setError(t('macrocycleDeleteError'));
    }
  };

  return (
    <div suppressHydrationWarning={true}>
      <PageContainer title={t('Macrociclos')} description={t('macrocyclesListDescription')}>
        <h1>{t('Macrociclos')}</h1>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            void openAddOverlay();
          }}
        >
          {t('addNewMacrocycle')}
        </Button>

        {/* Success/Error Messages */}
        {success ? (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.success.main }}>
            {success}
          </Typography>
        ) : (
          <></>
        )}
        {error ? (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
            {error}
          </Typography>
        ) : (
          <></>
        )}

        {/* MacroCycles Table */}
        <DashboardCard title={t('Macrociclos')}>
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            <Box sx={{ width: '100%', display: 'table', tableLayout: 'fixed' }}>
              <Table
                sx={{
                  whiteSpace: 'nowrap',
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {t('number')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {t('name')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {t('start')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {t('end')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {t('notes')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {t('actions')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {macroCycles.map((cycle) => (
                    <TableRow
                      key={cycle.id}
                      hover
                      onClick={() => openEditOverlay(cycle)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                          {cycle.number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                          {cycle.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                          {formatDate(cycle.startDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: '15px', fontWeight: '500' }}>
                          {formatDate(cycle.endDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: '14px',
                            color: 'textSecondary',
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {cycle.notes || t('na')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditOverlay(cycle);
                            }}
                          >
                            {t('Edit')}
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(cycle.id ?? -1);
                            }}
                          >
                            {t('Delete')}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </DashboardCard>
      </PageContainer>

      <Dialog open={dialogOpen} onClose={closeOverlay} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedMacrocycle ? t('editMacrocycle') : t('addMacrocycle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {selectedMacrocycle && (
              <TextField
                label={t('number')}
                value={selectedMacrocycle.number ?? '-'}
                slotProps={{ input: { readOnly: true } }}
                fullWidth
              />
            )}
            <TextField
              label={t('name')}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label={t('start')}
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
            <TextField
              label={t('end')}
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
            <TextField
              label={t('notes')}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeOverlay}>{t('Cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MacroCyclesList;
