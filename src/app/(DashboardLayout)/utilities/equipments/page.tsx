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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { EquipmentInterface } from '@/types/equipment/types';
import { useSession } from 'next-auth/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Size } from '@prisma/client';

interface NewEquipmentState {
  color: string;
  number: string; // input como string, validado para numero antes de enviar
  size: string;
}

interface SimpleEchelon {
  id: number;
  name: string;
}

const defaultNewEquipment = (): NewEquipmentState => ({
  color: '',
  number: '',
  size: '',
});

const EquipmentsPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: session, status } = useSession();

  const clubId = session?.user?.selectedClubId;
  const seasonId = session?.user?.selectedSeasonId;

  const [echelons, setEchelons] = useState<SimpleEchelon[]>([]);
  const [selectedEchelonId, setSelectedEchelonId] = useState<number | ''>('');

  const [equipments, setEquipments] = useState<EquipmentInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [newEquipment, setNewEquipment] = useState<NewEquipmentState>(defaultNewEquipment);
  const [editEquipment, setEditEquipment] = useState<EquipmentInterface | null>(null);

  const fetchEquipments = useCallback(async (): Promise<void> => {
    // Enquanto a sessão ainda está a carregar ou o utilizador não está autenticado,
    // não fazemos fetch nem mostramos erro de clube/época.
    if (status !== 'authenticated') {
      return;
    }

    if (!clubId || !seasonId) {
      setEquipments([]);
      setErrorMessage(t('equipment.missingClubOrSeason'));
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/clubs/${clubId}/seasons/${seasonId}/equipments`, {
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = (data as { error?: string }).error ?? t('equipment.fetchError');
        setErrorMessage(msg);
        setLoading(false);
        return;
      }

      setEquipments(data as EquipmentInterface[]);
    } catch {
      setErrorMessage(t('equipment.fetchNetworkError'));
    } finally {
      setLoading(false);
    }
  }, [status, clubId, seasonId, t]);

  useEffect(() => {
    void fetchEquipments();
  }, [fetchEquipments]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const loadEchelons = async (): Promise<void> => {
      try {
        const res = await fetch('/api/echelons', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{ id: number; name: string }>;
        setEchelons(data);

        // se ainda não houver escalão selecionado, escolher o primeiro
        if (data.length > 0 && selectedEchelonId === '') {
          setSelectedEchelonId(data[0].id);
        }
      } catch {
        // silencioso por enquanto; podemos adicionar erro dedicado se for preciso
      }
    };

    void loadEchelons();
  }, [status, selectedEchelonId]);

  const handleNewFieldChange = (field: keyof NewEquipmentState, value: string): void => {
    setNewEquipment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditFieldChange = (field: keyof EquipmentInterface, value: string): void => {
    setEditEquipment((prev) => {
      if (!prev) return prev;
      if (field === 'number' || field === 'echelonId') {
        const num = Number(value);
        return {
          ...prev,
          [field]: Number.isNaN(num)
            ? (undefined as unknown as EquipmentInterface[typeof field])
            : (num as EquipmentInterface[typeof field]),
        };
      }
      return {
        ...prev,
        [field]: value as EquipmentInterface[typeof field],
      };
    });
  };

  const handleAddEquipment = async (): Promise<void> => {
    if (!newEquipment.color.trim() || !newEquipment.number.trim() || !newEquipment.size.trim()) {
      setErrorMessage(t('equipment.formRequiredFields'));
      return;
    }

    if (selectedEchelonId === '' || selectedEchelonId === undefined || selectedEchelonId === null) {
      setErrorMessage(t('equipment.missingEchelon'));
      return;
    }

    const parsedNumber = Number(newEquipment.number);
    if (Number.isNaN(parsedNumber) || parsedNumber <= 0) {
      setErrorMessage(t('equipment.invalidNumber'));
      return;
    }

    setErrorMessage(null);

    try {
      const res = await fetch(`/api/clubs/${clubId}/seasons/${seasonId}/equipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          color: newEquipment.color.trim(),
          number: parsedNumber,
          size: newEquipment.size.trim(),
          echelonId: selectedEchelonId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = (data as { error?: string }).error ?? t('equipment.createError');
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage(t('equipment.createSuccess'));
      setNewEquipment(defaultNewEquipment());
      setOpenAddDialog(false);
      void fetchEquipments();
    } catch {
      setErrorMessage(t('equipment.createNetworkError'));
    }
  };

  const handleUpdateEquipment = async (): Promise<void> => {
    if (!editEquipment || editEquipment.id === null) return;

    if (!editEquipment.color.trim() || editEquipment.number === null || !editEquipment.size) {
      setErrorMessage(t('equipment.formRequiredFields'));
      return;
    }

    if (!editEquipment.echelonId || editEquipment.echelonId <= 0) {
      setErrorMessage(t('equipment.missingEchelon'));
      return;
    }

    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/clubs/${clubId}/seasons/${seasonId}/equipments/${editEquipment.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            color: editEquipment.color.trim(),
            number: editEquipment.number,
            size: editEquipment.size,
            echelonId: editEquipment.echelonId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg = (data as { error?: string }).error ?? t('equipment.updateError');
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage(t('equipment.updateSuccess'));
      setOpenEditDialog(false);
      setEditEquipment(null);
      void fetchEquipments();
    } catch {
      setErrorMessage(t('equipment.updateNetworkError'));
    }
  };

  const handleDeleteEquipment = async (id: number): Promise<void> => {
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/clubs/${clubId}/seasons/${seasonId}/equipments/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok || !(data as { success?: boolean }).success) {
        const msg = (data as { error?: string }).error ?? t('equipment.deleteError');
        setErrorMessage(msg);
        return;
      }

      setSuccessMessage(t('equipment.deleteSuccess'));
      void fetchEquipments();
    } catch {
      setErrorMessage(t('equipment.deleteNetworkError'));
    }
  };

  const filteredEquipments = useMemo(() => {
    if (!selectedEchelonId) return equipments;
    return equipments.filter((eq) => eq.echelonId === selectedEchelonId);
  }, [equipments, selectedEchelonId]);

  const groupedByColor = useMemo(() => {
    return filteredEquipments.reduce<Record<string, EquipmentInterface[]>>((acc, eq) => {
      const key = eq.color || t('equipment.unknownColor');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(eq);
      return acc;
    }, {});
  }, [filteredEquipments, t]);

  return (
    <Box sx={{ height: 700, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          {t('equipment.managementTitle')}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
          {t('Add')}
        </Button>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          select
          size="small"
          label={t('equipment.echelon')}
          value={selectedEchelonId === '' ? '' : selectedEchelonId}
          onChange={(e) => {
            const val = e.target.value;
            setSelectedEchelonId(val === '' ? '' : Number(val));
          }}
          sx={{ minWidth: 220 }}
          disabled={echelons.length === 0}
        >
          <MenuItem value="">{t('equipment.allEchelons')}</MenuItem>
          {echelons.map((ech) => (
            <MenuItem key={ech.id} value={ech.id}>
              {ech.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {loading && !errorMessage && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('equipment.loading')}
        </Typography>
      )}

      {!loading && equipments.length === 0 && !errorMessage && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('equipment.emptyList')}
        </Typography>
      )}

      {!loading && equipments.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.entries(groupedByColor).map(([color, items]) => (
            <Accordion key={color} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Typography variant="h6">{color}</Typography>
                  <Typography variant="body2">{items.length}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {items.map((eq) => (
                    <Box
                      key={eq.id ?? `${eq.color}-${eq.number}-${eq.size}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.5,
                        px: 1,
                        borderBottom: '1px solid rgba(0,0,0,0.12)',
                      }}
                    >
                      <Typography variant="body2">
                        Nº {eq.number} — {eq.size}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setEditEquipment(eq);
                            setOpenEditDialog(true);
                          }}
                        >
                          {t('Edit')}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setDeleteConfirmId(eq.id ?? 0)}
                        >
                          {t('Delete')}
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Add equipment dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('equipment.add')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            label={t('equipment.echelon')}
            fullWidth
            size="small"
            value={selectedEchelonId === '' ? '' : selectedEchelonId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedEchelonId(val === '' ? '' : Number(val));
            }}
            disabled={echelons.length === 0}
          >
            {echelons.map((ech) => (
              <MenuItem key={ech.id} value={ech.id}>
                {ech.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('equipment.color')}
            fullWidth
            size="small"
            value={newEquipment.color}
            onChange={(e) => handleNewFieldChange('color', e.target.value)}
          />
          <TextField
            label={t('equipment.number')}
            fullWidth
            size="small"
            value={newEquipment.number}
            onChange={(e) => handleNewFieldChange('number', e.target.value)}
          />
          <TextField
            select
            label={t('equipment.size')}
            fullWidth
            size="small"
            value={newEquipment.size}
            onChange={(e) => handleNewFieldChange('size', e.target.value)}
          >
            {Object.values(Size).map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>{t('Cancel')}</Button>
          <Button onClick={() => void handleAddEquipment()} variant="contained" color="primary">
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit equipment dialog */}
      <Dialog
        open={openEditDialog && !!editEquipment}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('equipment.edit')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            label={t('equipment.echelon')}
            fullWidth
            size="small"
            value={editEquipment?.echelonId ?? ''}
            onChange={(e) => handleEditFieldChange('echelonId', e.target.value)}
            disabled={echelons.length === 0}
          >
            {echelons.map((ech) => (
              <MenuItem key={ech.id} value={ech.id}>
                {ech.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('equipment.color')}
            fullWidth
            size="small"
            value={editEquipment?.color ?? ''}
            onChange={(e) => handleEditFieldChange('color', e.target.value)}
          />
          <TextField
            label={t('equipment.number')}
            fullWidth
            size="small"
            value={editEquipment?.number?.toString() ?? ''}
            onChange={(e) => handleEditFieldChange('number', e.target.value)}
          />
          <TextField
            select
            label={t('equipment.size')}
            fullWidth
            size="small"
            value={editEquipment?.size ?? ''}
            onChange={(e) => handleEditFieldChange('size', e.target.value)}
          >
            {Object.values(Size).map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenEditDialog(false);
              setEditEquipment(null);
            }}
          >
            {t('Cancel')}
          </Button>
          <Button onClick={() => void handleUpdateEquipment()} variant="contained" color="primary">
            {t('Save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('equipment.confirmDeleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('equipment.confirmDeleteMessage')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('Cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteConfirmId !== null) {
                void handleDeleteEquipment(deleteConfirmId);
                setDeleteConfirmId(null);
              }
            }}
            color="error"
            variant="contained"
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentsPage;
