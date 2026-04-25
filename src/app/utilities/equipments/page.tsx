'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Size } from '@prisma/client';
import type { EquipmentColorInterface, EquipmentItemInterface } from '@/types/equipmentColor/types';
import { useEchelons } from '@/hooks/useEchelons';
import {
  useClubEquipmentColors,
  useCreateColor,
  useUpdateColor,
  useDeleteColor,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from '@/hooks/useEquipments';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

const EquipmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: session, status } = useSession();

  const clubId = session?.user?.selectedClubId;
  const seasonId = session?.user?.selectedSeasonId;

  const [selectedEchelonId, setSelectedEchelonId] = useState<number | ''>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [openAddColorDialog, setOpenAddColorDialog] = useState<boolean>(false);
  const [newColor, setNewColor] = useState({
    color: '',
    colorHex: '#000000',
    numberColorHex: '#FFFFFF',
  });

  const [openEditColorDialog, setOpenEditColorDialog] = useState<boolean>(false);
  const [editColor, setEditColor] = useState<EquipmentColorInterface | null>(null);

  const [openAddEquipmentDialog, setOpenAddEquipmentDialog] = useState<boolean>(false);
  const [addEquipmentColorId, setAddEquipmentColorId] = useState<number | null>(null);
  const [newEquipment, setNewEquipment] = useState({ number: '', size: '' });

  const [openEditEquipmentDialog, setOpenEditEquipmentDialog] = useState<boolean>(false);
  const [editEquipment, setEditEquipment] = useState<{
    colorId: number;
    equipment: EquipmentItemInterface;
  } | null>(null);

  const [deleteColorId, setDeleteColorId] = useState<number | null>(null);
  const [deleteEquipmentInfo, setDeleteEquipmentInfo] = useState<{
    colorId: number;
    equipmentId: number;
  } | null>(null);

  const [expandedEchelon, setExpandedEchelon] = useState<string | false>(false);
  const [expandedColor, setExpandedColor] = useState<string | false>(false);
  const [initialExpandDone, setInitialExpandDone] = useState<boolean>(false);

  const isAddColorDirty = useFormSnapshotDirty(openAddColorDialog, newColor);
  const isEditColorDirty = useFormSnapshotDirty(openEditColorDialog, editColor);
  const isAddEquipmentDirty = useFormSnapshotDirty(openAddEquipmentDialog, newEquipment);
  const isEditEquipmentDirty = useFormSnapshotDirty(openEditEquipmentDialog, editEquipment);

  const { data: echelons = [], error: echelonsError } = useEchelons();
  const {
    data: equipmentColors = [],
    isFetching: equipmentsLoading,
    error: equipmentsError,
  } = useClubEquipmentColors(clubId, seasonId, selectedEchelonId === '' ? null : selectedEchelonId);

  useEffect(() => {
    if (echelons.length > 0 && selectedEchelonId === '' && echelons[0].id != null) {
      setSelectedEchelonId(echelons[0].id);
    }
  }, [echelons, selectedEchelonId]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (!clubId || !seasonId) {
      setErrorMessage(t('equipment.validation.missingClubOrSeason'));
    }
  }, [status, clubId, seasonId, t]);

  useEffect(() => {
    if (equipmentsError) {
      setErrorMessage((equipmentsError as Error).message || t('equipment.fetch.error'));
    }
  }, [equipmentsError, t]);

  useEffect(() => {
    if (echelonsError) {
      setErrorMessage((echelonsError as Error).message);
    }
  }, [echelonsError]);

  const createColorMutation = useCreateColor();
  const updateColorMutation = useUpdateColor();
  const deleteColorMutation = useDeleteColor();
  const createEquipmentMutation = useCreateEquipment();
  const updateEquipmentMutation = useUpdateEquipment();
  const deleteEquipmentMutation = useDeleteEquipment();

  const groupedByEchelon = useMemo(() => {
    const grouped: Record<string, EquipmentColorInterface[]> = {};
    equipmentColors.forEach((ec) => {
      const echelonName = ec.echelon?.name || t('equipment.echelon.unknown');
      if (!grouped[echelonName]) grouped[echelonName] = [];
      grouped[echelonName].push(ec);
    });
    return grouped;
  }, [equipmentColors, t]);

  const getEchelonItemCount = (echelonName: string): number => {
    const colors = groupedByEchelon[echelonName] ?? [];
    return colors.reduce((acc, c) => acc + (c.equipments?.length ?? 0), 0);
  };

  useEffect(() => {
    if (initialExpandDone) return;
    const echelonNames = Object.keys(groupedByEchelon);
    if (echelonNames.length === 0) return;

    const firstEchelon = echelonNames.sort()[0];
    const firstColor = (groupedByEchelon[firstEchelon] ?? [])[0];
    setExpandedEchelon(firstEchelon);
    if (firstColor) setExpandedColor(`${firstEchelon}-${firstColor.id}`);
    setInitialExpandDone(true);
  }, [groupedByEchelon, initialExpandDone]);

  const handleEchelonChange = (value: number | ''): void => {
    setSelectedEchelonId(value);
    setExpandedEchelon(false);
    setExpandedColor(false);
    setInitialExpandDone(false);
  };

  const handleAddColor = (): void => {
    if (!newColor.color.trim()) {
      setErrorMessage(t('equipment.color.required'));
      return;
    }
    if (!selectedEchelonId) {
      setErrorMessage(t('equipment.echelon.missing'));
      return;
    }
    if (!clubId || !seasonId) return;

    createColorMutation.mutate(
      {
        clubId,
        seasonId,
        echelonId: selectedEchelonId,
        color: newColor.color.trim(),
        colorHex: newColor.colorHex,
        numberColorHex: newColor.numberColorHex,
      },
      {
        onSuccess: () => {
          setSuccessMessage(t('equipment.color.createdSuccess'));
          setNewColor({ color: '', colorHex: '#000000', numberColorHex: '#FFFFFF' });
          setOpenAddColorDialog(false);
        },
        onError: (err) => {
          setErrorMessage((err as Error).message || t('equipment.save.createError'));
        },
      }
    );
  };

  const handleUpdateColor = (): void => {
    if (!editColor || !clubId || !seasonId) return;

    updateColorMutation.mutate(
      {
        clubId,
        seasonId,
        id: editColor.id,
        color: editColor.color,
        colorHex: editColor.colorHex ?? '#000000',
        numberColorHex: editColor.numberColorHex ?? '#FFFFFF',
      },
      {
        onSuccess: () => {
          setSuccessMessage(t('equipment.save.updateSuccess'));
          setOpenEditColorDialog(false);
          setEditColor(null);
        },
        onError: (err) => {
          setErrorMessage((err as Error).message || t('equipment.save.updateError'));
        },
      }
    );
  };

  const handleDeleteColor = (colorId: number): void => {
    if (!clubId || !seasonId) return;
    deleteColorMutation.mutate(
      { clubId, seasonId, id: colorId },
      {
        onSuccess: () => setSuccessMessage(t('equipment.save.deleteSuccess')),
        onError: (err) =>
          setErrorMessage((err as Error).message || t('equipment.save.deleteError')),
      }
    );
  };

  const handleAddEquipment = (): void => {
    if (!addEquipmentColorId || !clubId || !seasonId) return;
    if (!newEquipment.number || !newEquipment.size) {
      setErrorMessage(t('equipment.validation.formRequiredFields'));
      return;
    }

    createEquipmentMutation.mutate(
      {
        clubId,
        seasonId,
        colorId: addEquipmentColorId,
        number: Number(newEquipment.number),
        size: newEquipment.size,
      },
      {
        onSuccess: () => {
          setSuccessMessage(t('equipment.save.createSuccess'));
          setNewEquipment({ number: '', size: '' });
          setOpenAddEquipmentDialog(false);
          setAddEquipmentColorId(null);
        },
        onError: (err) => {
          setErrorMessage((err as Error).message || t('equipment.save.createError'));
        },
      }
    );
  };

  const handleUpdateEquipment = (): void => {
    if (!editEquipment || !clubId || !seasonId) return;

    updateEquipmentMutation.mutate(
      {
        clubId,
        seasonId,
        colorId: editEquipment.colorId,
        equipmentId: editEquipment.equipment.id,
        number: editEquipment.equipment.number,
        size: editEquipment.equipment.size,
      },
      {
        onSuccess: () => {
          setSuccessMessage(t('equipment.save.updateSuccess'));
          setOpenEditEquipmentDialog(false);
          setEditEquipment(null);
        },
        onError: (err) => {
          setErrorMessage((err as Error).message || t('equipment.save.updateError'));
        },
      }
    );
  };

  const handleDeleteEquipment = (colorId: number, equipmentId: number): void => {
    if (!clubId || !seasonId) return;
    deleteEquipmentMutation.mutate(
      { clubId, seasonId, colorId, equipmentId },
      {
        onSuccess: () => setSuccessMessage(t('equipment.save.deleteSuccess')),
        onError: (err) =>
          setErrorMessage((err as Error).message || t('equipment.save.deleteError')),
      }
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          {t('equipment.managementTitle')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddColorDialog(true)}
          disabled={!selectedEchelonId}
        >
          {t('equipment.color.add')}
        </Button>
      </Box>

      {echelons.length > 0 && (
        <FormControl sx={{ mb: 2, minWidth: 250 }} size="small">
          <InputLabel id="echelon-filter-label">{t('equipment.echelon.title')}</InputLabel>
          <Select
            labelId="echelon-filter-label"
            value={selectedEchelonId === '' ? '' : selectedEchelonId}
            label={t('equipment.echelon.title')}
            onChange={(e) => {
              const val = e.target.value as number | '';
              handleEchelonChange(val === '' ? '' : Number(val));
            }}
          >
            <MenuItem value="">{t('equipment.echelon.all')}</MenuItem>
            {echelons
              .filter((ech): ech is typeof ech & { id: number } => ech.id != null)
              .map((ech) => (
                <MenuItem key={ech.id} value={ech.id}>
                  {ech.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {equipmentsLoading && <Typography variant="body2">{t('equipment.list.loading')}</Typography>}

      {!equipmentsLoading && equipmentColors.length === 0 && !errorMessage && (
        <Typography color="text.secondary">{t('equipment.list.empty')}</Typography>
      )}

      {!equipmentsLoading &&
        Object.keys(groupedByEchelon)
          .sort()
          .map((echelonName) => (
            <Accordion
              key={echelonName}
              expanded={expandedEchelon === echelonName}
              onChange={(_, isExpanded) => {
                setExpandedEchelon(isExpanded ? echelonName : false);
                setExpandedColor(false);
              }}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {echelonName}
                  </Typography>
                  <Chip
                    label={`${getEchelonItemCount(echelonName)} ${t('equipment.items')}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {groupedByEchelon[echelonName].map((ec) => {
                  const colorKey = `${echelonName}-${ec.id}`;
                  return (
                    <Accordion
                      key={ec.id}
                      expanded={expandedColor === colorKey}
                      onChange={(_, isExpanded) => setExpandedColor(isExpanded ? colorKey : false)}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            pr: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                backgroundColor: ec.colorHex || '#ccc',
                                color: ec.numberColorHex || '#FFFFFF',
                                border: '1px solid #999',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 14,
                              }}
                            >
                              7
                            </Box>
                            <Typography sx={{ fontWeight: 'medium' }}>{ec.color}</Typography>
                            <Chip
                              label={`${ec.equipments?.length || 0} ${t('equipment.items')}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Box
                            sx={{ display: 'flex', gap: 0.5 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconButton
                              component="span"
                              size="small"
                              color="primary"
                              onClick={() => {
                                setAddEquipmentColorId(ec.id);
                                setOpenAddEquipmentDialog(true);
                              }}
                              title={t('equipment.item.add')}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              component="span"
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditColor(ec);
                                setOpenEditColorDialog(true);
                              }}
                              title={t('actions.edit')}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              component="span"
                              size="small"
                              color="error"
                              onClick={() => setDeleteColorId(ec.id)}
                              title={t('actions.delete')}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {ec.equipments && ec.equipments.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {ec.equipments.map((eq) => (
                              <Chip
                                key={eq.id}
                                label={`Nº ${eq.number} — ${eq.size}`}
                                onDelete={() =>
                                  setDeleteEquipmentInfo({
                                    colorId: ec.id,
                                    equipmentId: eq.id,
                                  })
                                }
                                onClick={() => {
                                  setEditEquipment({
                                    colorId: ec.id,
                                    equipment: { ...eq },
                                  });
                                  setOpenEditEquipmentDialog(true);
                                }}
                                sx={{
                                  cursor: 'pointer',
                                  backgroundColor: ec.colorHex || '#ccc',
                                  color: ec.numberColorHex || '#FFFFFF',
                                  fontWeight: 600,
                                  border: '1px solid rgba(0,0,0,0.2)',
                                  '& .MuiChip-deleteIcon': {
                                    color: ec.numberColorHex || '#FFFFFF',
                                    opacity: 0.8,
                                    '&:hover': {
                                      opacity: 1,
                                      color: ec.numberColorHex || '#FFFFFF',
                                    },
                                  },
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {t('equipment.item.noItems')}
                          </Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </AccordionDetails>
            </Accordion>
          ))}

      <GuardedDialog
        open={openAddColorDialog}
        onClose={() => setOpenAddColorDialog(false)}
        isDirty={isAddColorDirty}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('equipment.color.add')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('equipment.color.title')}
            fullWidth
            size="small"
            value={newColor.color}
            onChange={(e) => setNewColor({ ...newColor, color: e.target.value })}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label={t('equipment.color.backgroundLabel')}
              type="color"
              size="small"
              value={newColor.colorHex}
              onChange={(e) => setNewColor({ ...newColor, colorHex: e.target.value })}
              sx={{ flex: 1 }}
              slotProps={{
                input: { sx: { p: 0.5, height: 40 } },
                inputLabel: { shrink: true },
              }}
            />
            <TextField
              label={t('equipment.color.numberLabel')}
              type="color"
              size="small"
              value={newColor.numberColorHex}
              onChange={(e) => setNewColor({ ...newColor, numberColorHex: e.target.value })}
              sx={{ flex: 1 }}
              slotProps={{
                input: { sx: { p: 0.5, height: 40 } },
                inputLabel: { shrink: true },
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              p: 2,
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t('equipment.color.preview')}
            </Typography>
            <Box
              sx={{
                width: 56,
                height: 56,
                backgroundColor: newColor.colorHex,
                color: newColor.numberColorHex,
                border: '1px solid rgba(0,0,0,0.3)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 28,
              }}
            >
              7
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddColorDialog(false)}>{t('actions.cancel')}</Button>
          <Button
            onClick={handleAddColor}
            variant="contained"
            disabled={createColorMutation.isPending}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      <GuardedDialog
        open={openEditColorDialog && !!editColor}
        onClose={() => setOpenEditColorDialog(false)}
        isDirty={isEditColorDirty}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('equipment.color.edit')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('equipment.color.title')}
            fullWidth
            size="small"
            value={editColor?.color ?? ''}
            onChange={(e) => editColor && setEditColor({ ...editColor, color: e.target.value })}
          />
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label={t('equipment.color.backgroundLabel')}
              type="color"
              size="small"
              value={editColor?.colorHex ?? '#000000'}
              onChange={(e) =>
                editColor && setEditColor({ ...editColor, colorHex: e.target.value })
              }
              sx={{ flex: 1 }}
              slotProps={{
                input: { sx: { p: 0.5, height: 40 } },
                inputLabel: { shrink: true },
              }}
            />
            <TextField
              label={t('equipment.color.numberLabel')}
              type="color"
              size="small"
              value={editColor?.numberColorHex ?? '#FFFFFF'}
              onChange={(e) =>
                editColor && setEditColor({ ...editColor, numberColorHex: e.target.value })
              }
              sx={{ flex: 1 }}
              slotProps={{
                input: { sx: { p: 0.5, height: 40 } },
                inputLabel: { shrink: true },
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              p: 2,
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t('equipment.color.preview')}
            </Typography>
            <Box
              sx={{
                width: 56,
                height: 56,
                backgroundColor: editColor?.colorHex ?? '#000000',
                color: editColor?.numberColorHex ?? '#FFFFFF',
                border: '1px solid rgba(0,0,0,0.3)',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 28,
              }}
            >
              7
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditColorDialog(false)}>{t('actions.cancel')}</Button>
          <Button
            onClick={handleUpdateColor}
            variant="contained"
            disabled={updateColorMutation.isPending}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      <GuardedDialog
        open={openAddEquipmentDialog}
        onClose={() => setOpenAddEquipmentDialog(false)}
        isDirty={isAddEquipmentDirty}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('equipment.item.add')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('equipment.number')}
            fullWidth
            size="small"
            type="number"
            value={newEquipment.number}
            onChange={(e) => setNewEquipment({ ...newEquipment, number: e.target.value })}
          />
          <TextField
            select
            label={t('equipment.size.title')}
            fullWidth
            size="small"
            value={newEquipment.size}
            onChange={(e) => setNewEquipment({ ...newEquipment, size: e.target.value })}
          >
            {Object.values(Size).map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddEquipmentDialog(false)}>{t('actions.cancel')}</Button>
          <Button
            onClick={handleAddEquipment}
            variant="contained"
            disabled={createEquipmentMutation.isPending}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      <GuardedDialog
        open={openEditEquipmentDialog && !!editEquipment}
        onClose={() => setOpenEditEquipmentDialog(false)}
        isDirty={isEditEquipmentDirty}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('equipment.item.edit')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('equipment.number')}
            fullWidth
            size="small"
            type="number"
            value={editEquipment?.equipment.number ?? ''}
            onChange={(e) =>
              editEquipment &&
              setEditEquipment({
                ...editEquipment,
                equipment: { ...editEquipment.equipment, number: Number(e.target.value) },
              })
            }
          />
          <TextField
            select
            label={t('equipment.size.title')}
            fullWidth
            size="small"
            value={editEquipment?.equipment.size ?? ''}
            onChange={(e) =>
              editEquipment &&
              setEditEquipment({
                ...editEquipment,
                equipment: { ...editEquipment.equipment, size: e.target.value as Size },
              })
            }
          >
            {Object.values(Size).map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditEquipmentDialog(false)}>{t('actions.cancel')}</Button>
          <Button
            onClick={handleUpdateEquipment}
            variant="contained"
            disabled={updateEquipmentMutation.isPending}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      <Dialog open={deleteColorId !== null} onClose={() => setDeleteColorId(null)}>
        <DialogTitle>{t('equipment.delete.confirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('equipment.color.confirmDeleteMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteColorId(null)}>{t('actions.cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteColorId !== null) {
                handleDeleteColor(deleteColorId);
                setDeleteColorId(null);
              }
            }}
            color="error"
            variant="contained"
          >
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteEquipmentInfo !== null} onClose={() => setDeleteEquipmentInfo(null)}>
        <DialogTitle>{t('equipment.delete.confirmTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('equipment.delete.confirmMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteEquipmentInfo(null)}>{t('actions.cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteEquipmentInfo !== null) {
                handleDeleteEquipment(deleteEquipmentInfo.colorId, deleteEquipmentInfo.equipmentId);
                setDeleteEquipmentInfo(null);
              }
            }}
            color="error"
            variant="contained"
          >
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentsPage;
