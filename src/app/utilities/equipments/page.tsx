'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Size } from '@prisma/client';
import type { EquipmentColorInterface, EquipmentItemInterface } from '@/types/equipmentColor/types';

interface SimpleEchelon {
  id: number;
  name: string;
}

const EquipmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: session, status } = useSession();

  const clubId = session?.user?.selectedClubId;
  const seasonId = session?.user?.selectedSeasonId;

  const [echelons, setEchelons] = useState<SimpleEchelon[]>([]);
  const [selectedEchelonId, setSelectedEchelonId] = useState<number | ''>('');
  const [equipmentColors, setEquipmentColors] = useState<EquipmentColorInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add color dialog
  const [openAddColorDialog, setOpenAddColorDialog] = useState<boolean>(false);
  const [newColor, setNewColor] = useState({ color: '', colorHex: '#000000' });

  // Edit color dialog
  const [openEditColorDialog, setOpenEditColorDialog] = useState<boolean>(false);
  const [editColor, setEditColor] = useState<EquipmentColorInterface | null>(null);

  // Add equipment dialog
  const [openAddEquipmentDialog, setOpenAddEquipmentDialog] = useState<boolean>(false);
  const [addEquipmentColorId, setAddEquipmentColorId] = useState<number | null>(null);
  const [newEquipment, setNewEquipment] = useState({ number: '', size: '' });

  // Edit equipment dialog
  const [openEditEquipmentDialog, setOpenEditEquipmentDialog] = useState<boolean>(false);
  const [editEquipment, setEditEquipment] = useState<{
    colorId: number;
    equipment: EquipmentItemInterface;
  } | null>(null);

  // Delete confirmations
  const [deleteColorId, setDeleteColorId] = useState<number | null>(null);
  const [deleteEquipmentInfo, setDeleteEquipmentInfo] = useState<{
    colorId: number;
    equipmentId: number;
  } | null>(null);

  const fetchEquipmentColors = useCallback(async (): Promise<void> => {
    if (status !== 'authenticated') return;
    if (!clubId || !seasonId) {
      setEquipmentColors([]);
      setErrorMessage(t('equipment.validation.missingClubOrSeason'));
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const url = selectedEchelonId
        ? `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors?echelonId=${selectedEchelonId}`
        : `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors`;

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage((data as { error?: string }).error ?? t('equipment.fetch.error'));
        return;
      }

      setEquipmentColors(data as EquipmentColorInterface[]);
    } catch {
      setErrorMessage(t('equipment.fetch.networkError'));
    } finally {
      setLoading(false);
    }
  }, [status, clubId, seasonId, selectedEchelonId, t]);

  useEffect(() => {
    void fetchEquipmentColors();
  }, [fetchEquipmentColors]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const loadEchelons = async (): Promise<void> => {
      try {
        const res = await fetch('/api/echelons', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as SimpleEchelon[];
        setEchelons(data);
        setSelectedEchelonId((prev) => (prev === '' && data.length > 0 ? data[0].id : prev));
      } catch {
        // Silent
      }
    };

    void loadEchelons();
  }, [status]);

  // Group by echelon
  const groupedByEchelon = useMemo(() => {
    const grouped: Record<string, EquipmentColorInterface[]> = {};
    equipmentColors.forEach((ec) => {
      const echelonName = ec.echelon?.name || t('equipment.echelon.unknown');
      if (!grouped[echelonName]) grouped[echelonName] = [];
      grouped[echelonName].push(ec);
    });
    return grouped;
  }, [equipmentColors, t]);

  // Add color
  const handleAddColor = async (): Promise<void> => {
    if (!newColor.color.trim()) {
      setErrorMessage(t('equipment.color.required'));
      return;
    }
    if (!selectedEchelonId) {
      setErrorMessage(t('equipment.echelon.missing'));
      return;
    }

    try {
      const res = await fetch(`/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: newColor.color.trim(),
          colorHex: newColor.colorHex,
          echelonId: selectedEchelonId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage((data as { error?: string }).error ?? t('equipment.save.createError'));
        return;
      }

      setSuccessMessage(t('equipment.color.createdSuccess'));
      setNewColor({ color: '', colorHex: '#000000' });
      setOpenAddColorDialog(false);
      void fetchEquipmentColors();
    } catch {
      setErrorMessage(t('equipment.save.createNetworkError'));
    }
  };

  // Update color
  const handleUpdateColor = async (): Promise<void> => {
    if (!editColor) return;

    try {
      const res = await fetch(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${editColor.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            color: editColor.color,
            colorHex: editColor.colorHex,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage((data as { error?: string }).error ?? t('equipment.save.updateError'));
        return;
      }

      setSuccessMessage(t('equipment.save.updateSuccess'));
      setOpenEditColorDialog(false);
      setEditColor(null);
      void fetchEquipmentColors();
    } catch {
      setErrorMessage(t('equipment.save.updateNetworkError'));
    }
  };

  // Delete color
  const handleDeleteColor = async (colorId: number): Promise<void> => {
    try {
      const res = await fetch(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${colorId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage((data as { error?: string }).error ?? t('equipment.save.deleteError'));
        return;
      }

      setSuccessMessage(t('equipment.save.deleteSuccess'));
      void fetchEquipmentColors();
    } catch {
      setErrorMessage(t('equipment.save.deleteNetworkError'));
    }
  };

  // Add equipment item
  const handleAddEquipment = async (): Promise<void> => {
    if (!addEquipmentColorId) return;
    if (!newEquipment.number || !newEquipment.size) {
      setErrorMessage(t('equipment.validation.formRequiredFields'));
      return;
    }

    try {
      const res = await fetch(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${addEquipmentColorId}/equipments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: Number(newEquipment.number),
            size: newEquipment.size,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage((data as { error?: string }).error ?? t('equipment.save.createError'));
        return;
      }

      setSuccessMessage(t('equipment.save.createSuccess'));
      setNewEquipment({ number: '', size: '' });
      setOpenAddEquipmentDialog(false);
      setAddEquipmentColorId(null);
      void fetchEquipmentColors();
    } catch {
      setErrorMessage(t('equipment.save.createNetworkError'));
    }
  };

  // Update equipment item
  const handleUpdateEquipment = async (): Promise<void> => {
    if (!editEquipment) return;

    try {
      const res = await fetch(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${editEquipment.colorId}/equipments/${editEquipment.equipment.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            number: editEquipment.equipment.number,
            size: editEquipment.equipment.size,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage((data as { error?: string }).error ?? t('equipment.save.updateError'));
        return;
      }

      setSuccessMessage(t('equipment.save.updateSuccess'));
      setOpenEditEquipmentDialog(false);
      setEditEquipment(null);
      void fetchEquipmentColors();
    } catch {
      setErrorMessage(t('equipment.save.updateNetworkError'));
    }
  };

  // Delete equipment item
  const handleDeleteEquipment = async (colorId: number, equipmentId: number): Promise<void> => {
    try {
      const res = await fetch(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipment-colors/${colorId}/equipments/${equipmentId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) {
        const data = await res.json();
        setErrorMessage((data as { error?: string }).error ?? t('equipment.save.deleteError'));
        return;
      }

      setSuccessMessage(t('equipment.save.deleteSuccess'));
      void fetchEquipmentColors();
    } catch {
      setErrorMessage(t('equipment.save.deleteNetworkError'));
    }
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

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          select
          size="small"
          label={t('equipment.echelon.title')}
          value={selectedEchelonId === '' ? '' : selectedEchelonId}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedEchelonId(val === '' ? '' : Number(val));
          }}
          sx={{ minWidth: 220 }}
          disabled={echelons.length === 0}
        >
          <MenuItem value="">{t('equipment.echelon.all')}</MenuItem>
          {echelons.map((ech) => (
            <MenuItem key={ech.id} value={ech.id}>
              {ech.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

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

      {loading && <Typography variant="body2">{t('equipment.list.loading')}</Typography>}

      {!loading && equipmentColors.length === 0 && !errorMessage && (
        <Typography variant="body2">{t('equipment.list.empty')}</Typography>
      )}

      {!loading &&
        Object.entries(groupedByEchelon).map(([echelonName, colors]) => (
          <Box key={echelonName} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, color: 'text.secondary' }}>
              {echelonName}
            </Typography>
            {colors.map((ec) => (
              <Accordion key={ec.id} defaultExpanded sx={{ mb: 1 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          backgroundColor: ec.colorHex || '#ccc',
                          border: '1px solid #999',
                          borderRadius: 1,
                        }}
                      />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {ec.color}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${ec.equipments?.length || 0} ${t('equipment.items')}`}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        component="span"
                        size="small"
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
                          variant="outlined"
                          onDelete={() =>
                            setDeleteEquipmentInfo({ colorId: ec.id, equipmentId: eq.id })
                          }
                          onClick={() => {
                            setEditEquipment({ colorId: ec.id, equipment: { ...eq } });
                            setOpenEditEquipmentDialog(true);
                          }}
                          sx={{ cursor: 'pointer' }}
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
            ))}
          </Box>
        ))}

      {/* Add Color Dialog */}
      <Dialog
        open={openAddColorDialog}
        onClose={() => setOpenAddColorDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('equipment.color.add')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label={t('equipment.color.title')}
              fullWidth
              size="small"
              value={newColor.color}
              onChange={(e) => setNewColor({ ...newColor, color: e.target.value })}
            />
            <TextField
              type="color"
              size="small"
              value={newColor.colorHex}
              onChange={(e) => setNewColor({ ...newColor, colorHex: e.target.value })}
              sx={{ width: 60 }}
              slotProps={{ input: { sx: { p: 0.5, height: 40 } } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddColorDialog(false)}>{t('actions.cancel')}</Button>
          <Button onClick={() => void handleAddColor()} variant="contained">
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Color Dialog */}
      <Dialog
        open={openEditColorDialog && !!editColor}
        onClose={() => setOpenEditColorDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('equipment.color.edit')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label={t('equipment.color.title')}
              fullWidth
              size="small"
              value={editColor?.color ?? ''}
              onChange={(e) => editColor && setEditColor({ ...editColor, color: e.target.value })}
            />
            <TextField
              type="color"
              size="small"
              value={editColor?.colorHex ?? '#000000'}
              onChange={(e) =>
                editColor && setEditColor({ ...editColor, colorHex: e.target.value })
              }
              sx={{ width: 60 }}
              slotProps={{ input: { sx: { p: 0.5, height: 40 } } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditColorDialog(false)}>{t('actions.cancel')}</Button>
          <Button onClick={() => void handleUpdateColor()} variant="contained">
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Equipment Item Dialog */}
      <Dialog
        open={openAddEquipmentDialog}
        onClose={() => setOpenAddEquipmentDialog(false)}
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
          <Button onClick={() => void handleAddEquipment()} variant="contained">
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Equipment Item Dialog */}
      <Dialog
        open={openEditEquipmentDialog && !!editEquipment}
        onClose={() => setOpenEditEquipmentDialog(false)}
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
          <Button onClick={() => void handleUpdateEquipment()} variant="contained">
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Color Confirmation */}
      <Dialog open={deleteColorId !== null} onClose={() => setDeleteColorId(null)}>
        <DialogTitle>{t('equipment.delete.confirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('equipment.color.confirmDeleteMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteColorId(null)}>{t('actions.cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteColorId !== null) {
                void handleDeleteColor(deleteColorId);
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

      {/* Delete Equipment Confirmation */}
      <Dialog open={deleteEquipmentInfo !== null} onClose={() => setDeleteEquipmentInfo(null)}>
        <DialogTitle>{t('equipment.delete.confirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('equipment.delete.confirmMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteEquipmentInfo(null)}>{t('actions.cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteEquipmentInfo !== null) {
                void handleDeleteEquipment(
                  deleteEquipmentInfo.colorId,
                  deleteEquipmentInfo.equipmentId
                );
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
