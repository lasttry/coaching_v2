'use client';
import React, { useState, useEffect, ReactElement } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt';
import 'dayjs/locale/en';
import { MacrocycleInterface, MesocycleInterface } from '@/types/cycles/types';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';

dayjs.extend(localizedFormat);

const MesoCyclesList = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const [macroCycles, setMacroCycles] = useState<MacrocycleInterface[]>([]);
  const [macrocycleOptions, setMacrocycleOptions] = useState<MacrocycleInterface[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMesocycle, setSelectedMesocycle] = useState<MesocycleInterface | null>(null);
  const [form, setForm] = useState({
    macrocycleId: '',
    name: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const currentLocale = i18n.language?.startsWith('pt') ? 'pt' : 'en';
  const formatDate = (date: Date): string => dayjs(date).locale(currentLocale).format('L');
  const selectedMacrocycle = macrocycleOptions.find(
    (macro) => String(macro.id) === form.macrocycleId
  );
  const getDefaultDatesForMacrocycle = (
    macrocycle: MacrocycleInterface
  ): { startDate: string; endDate: string } => {
    const sortedMesocycles = [...(macrocycle.mesocycles || [])].sort(
      (a, b) => new Date(b.endDate as Date).getTime() - new Date(a.endDate as Date).getTime()
    );
    const referenceStart = sortedMesocycles.length
      ? dayjs(sortedMesocycles[0].endDate as Date)
      : dayjs(macrocycle.startDate);
    const macroEnd = dayjs(macrocycle.endDate);
    const suggestedEnd = referenceStart.add(1, 'month');
    const boundedEnd = suggestedEnd.isAfter(macroEnd) ? macroEnd : suggestedEnd;

    return {
      startDate: referenceStart.format('YYYY-MM-DD'),
      endDate: boundedEnd.format('YYYY-MM-DD'),
    };
  };
  const { message: error, setTimedMessage: setError } = useMessage(5000);
  const { message: success, setTimedMessage: setSuccess } = useMessage(5000);

  useEffect(() => {
    async function fetchMacroCycles(): Promise<void> {
      try {
        const response = await fetch('/api/cycles/macrocycles');
        if (!response.ok) {
          throw new Error(`Failed to fetch mesocycles. Status: ${response.status}`);
        }
        const data: MacrocycleInterface[] = await response.json();
        setMacroCycles(data);
      } catch (err) {
        log.error('Error fetching mesocycles:', err);
        setError(t('cycles.mesocycle.fetch.error'));
      }
    }

    fetchMacroCycles();
  }, [setError]);

  useEffect(() => {
    setMacrocycleOptions(macroCycles);
  }, [macroCycles]);

  const openAddOverlay = (): void => {
    setSelectedMesocycle(null);
    setForm({
      macrocycleId: '',
      name: '',
      startDate: '',
      endDate: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const openEditOverlay = (mesocycle: MesocycleInterface): void => {
    setSelectedMesocycle(mesocycle);
    setForm({
      macrocycleId: String(mesocycle.macrocycleId || ''),
      name: mesocycle.name || '',
      startDate: mesocycle.startDate ? dayjs(mesocycle.startDate).format('YYYY-MM-DD') : '',
      endDate: mesocycle.endDate ? dayjs(mesocycle.endDate).format('YYYY-MM-DD') : '',
      notes: mesocycle.notes || '',
    });
    setDialogOpen(true);
  };

  const closeOverlay = (): void => {
    setDialogOpen(false);
    setSelectedMesocycle(null);
  };

  const handleSave = async (): Promise<void> => {
    if (!form.macrocycleId || !form.startDate || !form.endDate) {
      setError(t('messages.missingFields'));
      return;
    }
    if (selectedMacrocycle) {
      const macroStart = dayjs(selectedMacrocycle.startDate).startOf('day');
      const macroEnd = dayjs(selectedMacrocycle.endDate).endOf('day');
      const selectedStart = dayjs(form.startDate).startOf('day');
      const selectedEnd = dayjs(form.endDate).endOf('day');
      if (
        selectedStart.isBefore(macroStart) ||
        selectedStart.isAfter(macroEnd) ||
        selectedEnd.isBefore(macroStart) ||
        selectedEnd.isAfter(macroEnd)
      ) {
        setError(t('cycles.mesocycle.validation.dateOutOfRange'));
        return;
      }
      if (selectedEnd.isBefore(selectedStart)) {
        setError(t('cycles.mesocycle.validation.endBeforeStart'));
        return;
      }
    }

    try {
      const isEditing = Boolean(selectedMesocycle?.id);
      const response = await fetch(
        isEditing ? `/api/cycles/mesocycles/${selectedMesocycle?.id}` : '/api/cycles/mesocycles',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            macrocycleId: Number(form.macrocycleId),
            name: form.name,
            startDate: new Date(form.startDate).toISOString(),
            endDate: new Date(form.endDate).toISOString(),
            notes: form.notes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(t('cycles.mesocycle.save.error'));
      }

      setSuccess(
        isEditing
          ? t('cycles.mesocycle.save.updateSuccess')
          : t('cycles.mesocycle.save.createSuccess')
      );
      closeOverlay();

      const refreshed = await fetch('/api/cycles/macrocycles');
      const refreshedData: MacrocycleInterface[] = await refreshed.json();
      setMacroCycles(refreshedData);
    } catch (err) {
      log.error('Error saving mesocycle:', err);
      setError(t('cycles.mesocycle.save.error'));
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    const confirmed = window.confirm(t('cycles.mesocycle.delete.confirm', { id }));
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cycles/mesocycles/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuccess(t('cycles.mesocycle.delete.success', { id }));
        setMacroCycles((prev) =>
          prev.map((macro) => ({
            ...macro,
            mesocycles: macro.mesocycles.filter((meso) => meso.id !== id),
          }))
        );
      } else {
        setError(t('cycles.mesocycle.delete.error'));
      }
    } catch (err) {
      log.error('Error deleting mesocycle:', err);
      setError(t('cycles.mesocycle.delete.error'));
    }
  };

  return (
    <div suppressHydrationWarning={true}>
      <PageContainer
        title={t('cycles.mesocycle.title')}
        description={t('cycles.mesocycle.description')}
      >
        <h1>{t('cycles.mesocycle.title')}</h1>
        <Button variant="contained" color="primary" onClick={openAddOverlay}>
          {t('cycles.mesocycle.addNew')}
        </Button>

        {/* Success/Error Messages */}
        {success && (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.success.main }}>
            {success}
          </Typography>
        )}
        {error && (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
            {error}
          </Typography>
        )}

        {/* MacroCycle and MesoCycles Table */}
        <DashboardCard title={t('cycles.mesocycle.title')}>
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            {macroCycles.map((macrocycle) => (
              <Box key={macrocycle.id} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('cycles.macrocycle.singular')}:{' '}
                  {macrocycle.name ||
                    `${t('cycles.macrocycle.singular')} ${macrocycle.number || macrocycle.id}`}{' '}
                  ({formatDate(macrocycle.startDate)} - {formatDate(macrocycle.endDate)})
                </Typography>
                <Table sx={{ whiteSpace: 'nowrap' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t('cycles.mesocycle.number')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t('common.name')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t('common.start')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t('common.end')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t('common.notes')}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {t('common.actions')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {macrocycle.mesocycles.map((mesocycle) => (
                      <TableRow key={mesocycle.id} hover>
                        <TableCell>
                          <Typography>{`${macrocycle.number ?? macrocycle.id}.${mesocycle.number ?? mesocycle.id}`}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{mesocycle.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{formatDate(mesocycle.startDate as Date)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{formatDate(mesocycle.endDate as Date)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{mesocycle.notes || t('common.na')}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={2}>
                            <Tooltip title={t('actions.edit')}>
                              <IconButton
                                color="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditOverlay(mesocycle);
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('actions.delete')}>
                              <IconButton
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(mesocycle.id);
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ))}
          </Box>
        </DashboardCard>
      </PageContainer>
      <Dialog open={dialogOpen} onClose={closeOverlay} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedMesocycle ? t('cycles.mesocycle.edit') : t('cycles.mesocycle.add')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('cycles.macrocycle.select')}</InputLabel>
              <Select
                label={t('cycles.macrocycle.select')}
                value={form.macrocycleId}
                onChange={(e) => {
                  const selectedId = String(e.target.value);
                  const macro = macrocycleOptions.find((item) => String(item.id) === selectedId);
                  if (!macro) {
                    setForm((prev) => ({ ...prev, macrocycleId: selectedId }));
                    return;
                  }
                  const defaults = getDefaultDatesForMacrocycle(macro);
                  setForm((prev) => ({
                    ...prev,
                    macrocycleId: selectedId,
                    startDate: defaults.startDate,
                    endDate: defaults.endDate,
                  }));
                }}
              >
                {macrocycleOptions.map((macro) => (
                  <MenuItem key={macro.id} value={String(macro.id)}>
                    {macro.name || `${t('cycles.macrocycle.singular')} ${macro.number || macro.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('common.name')}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label={t('common.start')}
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  min: selectedMacrocycle
                    ? dayjs(selectedMacrocycle.startDate).format('YYYY-MM-DD')
                    : undefined,
                  max: selectedMacrocycle
                    ? dayjs(selectedMacrocycle.endDate).format('YYYY-MM-DD')
                    : undefined,
                },
              }}
              fullWidth
              required
            />
            <TextField
              label={t('common.end')}
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: {
                  min: form.startDate
                    ? form.startDate
                    : selectedMacrocycle
                      ? dayjs(selectedMacrocycle.startDate).format('YYYY-MM-DD')
                      : undefined,
                  max: selectedMacrocycle
                    ? dayjs(selectedMacrocycle.endDate).format('YYYY-MM-DD')
                    : undefined,
                },
              }}
              fullWidth
              required
            />
            <TextField
              label={t('common.notes')}
              multiline
              rows={4}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeOverlay}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MesoCyclesList;
