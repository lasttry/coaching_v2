'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { OpponentInterface } from '@/types/games/types';
import { useTranslation } from 'react-i18next';
import OpponentComponent from './Opponent';
import { log } from '@/lib/logger';

interface OpponentListProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  opponents: OpponentInterface[];
  setOpponents: React.Dispatch<React.SetStateAction<OpponentInterface[]>>;
}

const OpponentListComponent: React.FC<OpponentListProps> = ({
  setErrorMessage,
  setSuccessMessage,
  opponents,
  setOpponents,
}) => {
  const { t } = useTranslation();

  const [editMode, setEditMode] = useState<{ [id: number]: boolean }>({});
  const [editedOpponents, setEditedOpponents] = useState<{ [id: number]: OpponentInterface }>({});
  const [deleteConfirm, setDeleteConfirm] = useState<OpponentInterface | null>();
  const [expandedId, setExpandedId] = useState<number | null | undefined>(null);

  const handleEditToggle = (id: number): void => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    const opponent = opponents.find((o) => o.id === id);
    if (opponent) setEditedOpponents((prev) => ({ ...prev, [id]: { ...opponent } }));
    setExpandedId(id);
  };

  const handleSave = async (id: number): Promise<void> => {
    const updatedOpponent = editedOpponents[id];
    if (!updatedOpponent) return;

    const res = await fetch(`/api/opponents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedOpponent),
    });

    if (!res.ok) {
      setErrorMessage(t('opponentFailedSave'));
      setTimeout(() => setErrorMessage(null), 10000);
      return;
    }

    const updated = await res.json();
    setOpponents((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSuccessMessage(t('opponentSuccessUpdate'));
    setTimeout(() => setSuccessMessage(null), 5000);
    setEditMode((prev) => ({ ...prev, [id]: false }));
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      const res = await fetch(`/api/opponents/${id}`, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = data?.error || t('opponentFailedDelete');
        setErrorMessage(errorMessage);
        log.error('Delete failed:', errorMessage);
        setTimeout(() => setErrorMessage(null), 10000);
        setDeleteConfirm(null); // Close the dialog
        return;
      }

      setOpponents((prev) => prev.filter((o) => o.id !== id));
      setSuccessMessage(t('opponentDeleteSuccess'));
      setTimeout(() => setSuccessMessage(null), 5000);
      setDeleteConfirm(null); // Close the dialog
    } catch (err) {
      setErrorMessage(t('opponentFailedDelete'));
      log.error('Network or unexpected error:', err);
      setTimeout(() => setErrorMessage(null), 10000);
      setDeleteConfirm(null); // Close the dialog
    }
  };

  return (
    <>
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('deleteConfirmationMessage')} <strong>{deleteConfirm?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>{t('cancel')}</Button>
          <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm.id!)} color="error" variant="contained">
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <DashboardCard title={t('opponents')}>
        {opponents &&
         opponents.map((opponent) => {
          const isEditing = editMode[opponent.id!];
          const edited = editedOpponents[opponent.id!];

          return (
            <Accordion
              key={opponent.id}
              expanded={expandedId === opponent.id}
              onChange={(_, expanded) => setExpandedId(expanded ? opponent.id : null)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }} >
                  <Grid size={2}>
                    <Box
                      component="img"
                      src={opponent.image}
                      alt={opponent.name}
                      sx={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 1, ml: 2 }}
                    />
                  </Grid>
                  <Grid size={5}>
                    <Typography>{opponent.name}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>{opponent.shortName}</Typography>
                  </Grid>
                  <Grid size={2} sx={{ ml: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.1 }}>
                    {isEditing ? (
                        <IconButton component="span" size="small" color="success" onClick={(e) => { e.stopPropagation(); handleSave(opponent.id!); }}>
                          <SaveIcon />
                        </IconButton>
                      ) : (
                        <IconButton component="span" size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEditToggle(opponent.id!); }}>
                          <EditIcon />
                        </IconButton>
                      )}
                      <IconButton component="span" size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(opponent); }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2} alignItems="center">
                  { isEditing ? (
                    <OpponentComponent
                      opponent={edited}
                      setOpponent={(updated) =>
                        setEditedOpponents((prev) => ({
                          ...prev,
                          [Number(opponent.id)]: updated as OpponentInterface,
                        }))
                      }
                    />
                  ) : (
                    <Grid size={{ xs: 12 }}>
                    <Typography variant="body2">
                      {t('venues')}: {opponent.venues?.map((v) => v.name).join(', ') || t('noVenues')}
                    </Typography>
                  </Grid>
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </DashboardCard>
    </>
  );
};

OpponentListComponent.displayName = 'OpponentListComponent';
export default OpponentListComponent;
