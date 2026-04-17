'use client';
import React, { ReactElement } from 'react';
import MicrocycleDetailsDialog from '@/app/(DashboardLayout)/components/shared/MicrocycleDetailsDialog';
import { useState, useEffect } from 'react';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/pt';
import 'dayjs/locale/en';
import {
  MicrocycleInterface,
  MesocycleInterface,
  MacrocycleInterface,
  SessionGoalInterface,
} from '@/types/cycles/types';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';

dayjs.extend(localizedFormat);

const MicrocyclesList = (): ReactElement => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<
    {
      macrocycle: MacrocycleInterface;
      mesocycles: {
        mesocycle: MesocycleInterface;
        microcycles: MicrocycleInterface[];
      }[];
    }[]
  >([]);
  const { message: error, setTimedMessage: setError } = useMessage(5000);
  const { message: success, setTimedMessage: setSuccess } = useMessage(5000);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMicrocycle, setSelectedMicrocycle] = useState<MicrocycleInterface | null>(null);
  const [selectedMacrocycleId, setSelectedMacrocycleId] = useState<string>('');
  const [form, setForm] = useState({
    mesocycleId: '',
    number: '',
    name: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const currentLocale = i18n.language?.startsWith('pt') ? 'pt' : 'en';
  const formatDate = (date: Date): string => dayjs(date).locale(currentLocale).format('L');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsData, setDetailsData] = useState<SessionGoalInterface[] | null>(null);
  const [currentMacrocycle, setCurrentMacrocycle] = useState<MacrocycleInterface | null>(null);
  const [currentMesocycle, setCurrentMesocycle] = useState<MesocycleInterface | null>(null);

  const openDetailsOverlay = async (microcycleId: number): Promise<void> => {
    try {
      const currentData = findMicrocycleById(microcycleId);
      if (currentData && currentData.microcycle.sessionGoals) {
        setDetailsData(currentData.microcycle.sessionGoals);
        setCurrentMacrocycle(currentData.macrocycle);
        setCurrentMesocycle(currentData.mesocycle);
      } else {
        setDetailsData(null); // Set to null if sessionGoals is undefined
      }
      setDetailsOpen(true);
    } catch (err) {
      log.error('Error fetching details:', err);
    }
  };

  const closeDetailsOverlay = (): void => {
    setDetailsOpen(false);
    setDetailsData(null);
    setCurrentMacrocycle(null);
    setCurrentMesocycle(null);
  };

  const findMicrocycleById = (
    microcycleId: number
  ): {
    macrocycle: MacrocycleInterface;
    mesocycle: MesocycleInterface;
    microcycle: MicrocycleInterface;
  } | null => {
    for (const macroGroup of data) {
      for (const mesoGroup of macroGroup.mesocycles) {
        const foundMicrocycle = mesoGroup.microcycles.find((micro) => micro.id === microcycleId);
        if (foundMicrocycle) {
          return {
            macrocycle: macroGroup.macrocycle,
            mesocycle: mesoGroup.mesocycle,
            microcycle: foundMicrocycle,
          };
        }
      }
    }
    return null; // Return null if no microcycle is found
  };

  // Fetch the list of microcycles grouped by Macrocycle and Mesocycle
  useEffect(() => {
    async function fetchMicrocycles(): Promise<void> {
      try {
        const response = await fetch('/api/cycles/microcycles'); // Fetching microcycles from the API
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const microcycles: MicrocycleInterface[] = await response.json();

        // Group Microcycles by Macrocycle → Mesocycle with null safety checks
        const groupedData = microcycles.reduce<
          Record<
            number,
            {
              macrocycle: MacrocycleInterface;
              mesocycles: Record<
                number,
                {
                  mesocycle: MesocycleInterface;
                  microcycles: MicrocycleInterface[];
                }
              >;
            }
          >
        >((acc, microcycle) => {
          const macrocycle = microcycle.mesocycle?.macrocycle;
          const mesocycle = microcycle.mesocycle;

          if (!macrocycle || !mesocycle) {
            log.warn('Skipping microcycle due to missing macrocycle or mesocycle:', microcycle);
            return acc;
          }

          // Initialize macrocycle group if not already present
          if (!acc[macrocycle.id]) {
            acc[macrocycle.id] = {
              macrocycle,
              mesocycles: {},
            };
          }

          // Initialize mesocycle group if not already present
          if (!acc[macrocycle.id].mesocycles[mesocycle.id]) {
            acc[macrocycle.id].mesocycles[mesocycle.id] = {
              mesocycle,
              microcycles: [],
            };
          }

          // Add microcycle to the corresponding mesocycle
          acc[macrocycle.id].mesocycles[mesocycle.id].microcycles.push(microcycle);

          return acc;
        }, {});

        // Convert grouped data to an array and sort each group by date ascending
        const groupedArray = Object.values(groupedData).map((macroGroup) => ({
          ...macroGroup,
          mesocycles: Object.values(macroGroup.mesocycles).map((mesoGroup) => ({
            ...mesoGroup,
            microcycles: mesoGroup.microcycles.sort(
              (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            ),
          })),
        }));

        setData(groupedArray);
      } catch (err) {
        log.error('Error fetching microcycles:', err);
        setError('Failed to fetch microcycles.');
      }
    }

    fetchMicrocycles();
  }, [setError]);

  // Handle microcycle deletion
  const handleDelete = async (id: number): Promise<void> => {
    const confirmed = window.confirm(`Are you sure you want to delete Microcycle ID ${id}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cycles/microcycles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess(`Microcycle ID ${id} deleted successfully.`);
        setData((prev) =>
          prev.map((macro) => ({
            ...macro,
            mesocycles: macro.mesocycles.map((meso) => ({
              ...meso,
              microcycles: meso.microcycles.filter((cycle) => cycle.id !== id),
            })),
          }))
        );
      } else {
        setError('Failed to delete microcycle.');
      }
    } catch (err) {
      log.error('Error deleting microcycle:', err);
      setError('An error occurred while deleting the microcycle.');
    }
  };

  const openAddOverlay = (): void => {
    setSelectedMicrocycle(null);
    setSelectedMacrocycleId('');
    setForm({
      mesocycleId: '',
      number: '',
      name: '',
      startDate: '',
      endDate: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const openEditOverlay = (cycle: MicrocycleInterface): void => {
    setSelectedMicrocycle(cycle);
    const macrocycleId = String(cycle.mesocycle?.macrocycle?.id || '');
    setSelectedMacrocycleId(macrocycleId);
    setForm({
      mesocycleId: String(cycle.mesocycle?.id || ''),
      number: String(cycle.number || ''),
      name: cycle.name || '',
      startDate: dayjs(cycle.startDate).format('YYYY-MM-DD'),
      endDate: dayjs(cycle.endDate).format('YYYY-MM-DD'),
      notes: cycle.notes || '',
    });
    setDialogOpen(true);
  };

  const closeOverlay = (): void => {
    setDialogOpen(false);
    setSelectedMicrocycle(null);
  };

  const selectedMacroData = data.find(
    (macro) => String(macro.macrocycle.id) === selectedMacrocycleId
  );

  const handleSave = async (): Promise<void> => {
    if (!form.mesocycleId || !form.startDate || !form.endDate) {
      setError(t('missingFields'));
      return;
    }

    try {
      const isEditing = Boolean(selectedMicrocycle?.id);
      const payload = {
        number: form.number ? Number(form.number) : null,
        name: form.name,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        notes: form.notes,
        ...(isEditing
          ? {
              mesocycleId: Number(form.mesocycleId),
              sessionGoals: selectedMicrocycle?.sessionGoals || [],
            }
          : {
              mesocycle: { id: Number(form.mesocycleId) },
              sessionGoals: [],
            }),
      };
      const response = await fetch(
        isEditing ? `/api/cycles/microcycles/${selectedMicrocycle?.id}` : '/api/cycles/microcycles',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save microcycle');
      }

      setSuccess(isEditing ? t('microcycleUpdatedSuccess') : t('microcycleCreatedSuccess'));
      closeOverlay();

      const refreshed = await fetch('/api/cycles/microcycles');
      const microcycles: MicrocycleInterface[] = await refreshed.json();
      const groupedData = microcycles.reduce<
        Record<
          number,
          {
            macrocycle: MacrocycleInterface;
            mesocycles: Record<
              number,
              {
                mesocycle: MesocycleInterface;
                microcycles: MicrocycleInterface[];
              }
            >;
          }
        >
      >((acc, microcycle) => {
        const macrocycle = microcycle.mesocycle?.macrocycle;
        const mesocycle = microcycle.mesocycle;
        if (!macrocycle || !mesocycle) return acc;
        if (!acc[macrocycle.id]) {
          acc[macrocycle.id] = { macrocycle, mesocycles: {} };
        }
        if (!acc[macrocycle.id].mesocycles[mesocycle.id]) {
          acc[macrocycle.id].mesocycles[mesocycle.id] = { mesocycle, microcycles: [] };
        }
        acc[macrocycle.id].mesocycles[mesocycle.id].microcycles.push(microcycle);
        return acc;
      }, {});
      const groupedArray = Object.values(groupedData).map((macroGroup) => ({
        ...macroGroup,
        mesocycles: Object.values(macroGroup.mesocycles).map((mesoGroup) => ({
          ...mesoGroup,
          microcycles: mesoGroup.microcycles.sort(
            (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          ),
        })),
      }));
      setData(groupedArray);
    } catch (err) {
      log.error('Error saving microcycle:', err);
      setError(t('microcycleSaveFailed'));
    }
  };

  return (
    <div suppressHydrationWarning={true}>
      <MicrocycleDetailsDialog
        open={detailsOpen}
        onClose={closeDetailsOverlay}
        data={detailsData}
        macrocycle={currentMacrocycle}
        mesocycle={currentMesocycle}
      />
      <PageContainer
        title="Microcycles"
        description="List of all microcycles grouped by Macrocycle and Mesocycle"
      >
        <h1>Microcycles</h1>
        <Button variant="contained" color="primary" onClick={openAddOverlay}>
          {t('addNewMicrocycle')}
        </Button>

        {/* Success/Error Messages */}
        {success ? (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.success.main }}>
            {success}
          </Typography>
        ) : null}
        {error ? (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
            {error}
          </Typography>
        ) : null}

        {/* Microcycles List */}
        {data.map((macro) => (
          <Accordion key={macro.macrocycle.id} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Macrocycle:{' '}
                {macro.macrocycle.name || `Macrocycle ${macro.macrocycle.number || 'N/A'}`} (
                {formatDate(macro.macrocycle.startDate)} to {formatDate(macro.macrocycle.endDate)})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {macro.mesocycles.map((meso) => (
                <Accordion key={meso.mesocycle.id} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">
                      Mesocycle:{' '}
                      {meso.mesocycle.name || `Mesocycle ${meso.mesocycle.number || 'N/A'}`} (
                      {formatDate(meso.mesocycle.startDate as Date)} to{' '}
                      {formatDate(meso.mesocycle.endDate as Date)})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DashboardCard title="Microcycles">
                      <Table
                        sx={{
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Number
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Name
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Start Date
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                End Date
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Notes
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Actions
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {meso.microcycles.map((cycle) => (
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
                                  {cycle.notes || 'N/A'}
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
                                    Edit
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(cycle.id ?? -1);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDetailsOverlay(cycle.id);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </DashboardCard>
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </PageContainer>
      <Dialog open={dialogOpen} onClose={closeOverlay} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedMicrocycle ? t('editMicrocycle') : t('addMicrocycle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('selectMacrocycle')}</InputLabel>
              <Select
                label={t('selectMacrocycle')}
                value={selectedMacrocycleId}
                onChange={(e) => {
                  const value = String(e.target.value);
                  setSelectedMacrocycleId(value);
                  setForm((prev) => ({ ...prev, mesocycleId: '' }));
                }}
              >
                {data.map((macro) => (
                  <MenuItem key={macro.macrocycle.id} value={String(macro.macrocycle.id)}>
                    {macro.macrocycle.name ||
                      `${t('macrocycle')} ${macro.macrocycle.number || macro.macrocycle.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>{t('selectMesocycle')}</InputLabel>
              <Select
                label={t('selectMesocycle')}
                value={form.mesocycleId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, mesocycleId: String(e.target.value) }))
                }
              >
                {(selectedMacroData?.mesocycles || []).map((mesoGroup) => (
                  <MenuItem key={mesoGroup.mesocycle.id} value={String(mesoGroup.mesocycle.id)}>
                    {mesoGroup.mesocycle.name ||
                      `${t('mesocycle')} ${mesoGroup.mesocycle.number || mesoGroup.mesocycle.id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('number')}
              type="number"
              value={form.number}
              onChange={(e) => setForm((prev) => ({ ...prev, number: e.target.value }))}
              fullWidth
            />
            <TextField
              label={t('name')}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label={t('start')}
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
            <TextField
              label={t('end')}
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              required
            />
            <TextField
              label={t('notes')}
              multiline
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
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

export default MicrocyclesList;
