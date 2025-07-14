'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Stack,
  Switch,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AthleteInterface } from '@/types/games/types';
import { useTranslation } from 'react-i18next';

interface AthleteListComponentProps {
  athletes: AthleteInterface[];
  onEdit: (athlete: AthleteInterface) => void;
  onDelete: (id: number) => void;
}

const AthleteListComponent: React.FC<AthleteListComponentProps> = ({
  athletes,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const [editMode, setEditMode] = useState<{ [id: number]: boolean }>({});
  const [editedAthletes, setEditedAthletes] = useState<{ [id: number]: AthleteInterface }>({});
  const [deleteConfirm, setDeleteConfirm] = useState<AthleteInterface | null>(null);

  const handleEditToggle = (id: number): void => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    setEditedAthletes((prev) => ({ ...prev, [id]: athletes.find((a) => a.id === id)! }));
  };

  const handleEditChange = (
    id: number,
    field: keyof AthleteInterface,
    value: string | number | boolean | null
  ): void => {
    setEditedAthletes((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = (id: number): void => {
    onEdit(editedAthletes[id]);
    setEditMode((prev) => ({ ...prev, [id]: false }));
  };

  const openDeleteDialog = (athlete: AthleteInterface) => {
    setDeleteConfirm(athlete);
  };

  const confirmDelete = () => {
    if (deleteConfirm?.id) {
      onDelete(deleteConfirm.id);
    }
    setDeleteConfirm(null);
  };

  return (
    <>
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('deleteConfirmationMessage')}:<br />
            <strong>{deleteConfirm?.number}</strong> – {deleteConfirm?.name} (
            {new Date(deleteConfirm?.birthdate || '').toLocaleDateString()})<br />
            <br />
            ⚠️ {t('deletionWarningGames')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>{t('cancel')}</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Accordion defaultExpanded sx={{ marginTop: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">{t('athletes')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table component={Paper}>
            <TableHead>
              <TableRow>
                <TableCell>{t('number')}</TableCell>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('birthdate')}</TableCell>
                <TableCell>{t('fpbNumber')}</TableCell>
                <TableCell>{t('active')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...athletes]
                .sort((a, b) => {
                  const yearA = new Date(a.birthdate).getFullYear();
                  const yearB = new Date(b.birthdate).getFullYear();
                  if (yearA !== yearB) return yearB - yearA;
                  return a.name.localeCompare(b.name);
                })
                .map((athlete) => {
                  const isEditing = editMode[athlete.id!];
                  return (
                    <TableRow key={athlete.id}>
                      {isEditing ? (
                        <>
                          <TableCell>
                            <TextField
                              value={editedAthletes[athlete.id!]?.number || ''}
                              onChange={(e) =>
                                handleEditChange(athlete.id!, 'number', e.target.value)
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={editedAthletes[athlete.id!]?.name || ''}
                              onChange={(e) =>
                                handleEditChange(athlete.id!, 'name', e.target.value)
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="date"
                              value={
                                editedAthletes[athlete.id!]?.birthdate
                                  ? new Date(editedAthletes[athlete.id!]?.birthdate)
                                      .toISOString()
                                      .split('T')[0]
                                  : ''
                              }
                              onChange={(e) =>
                                handleEditChange(athlete.id!, 'birthdate', e.target.value)
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={editedAthletes[athlete.id!]?.fpbNumber || ''}
                              onChange={(e) =>
                                handleEditChange(
                                  athlete.id!,
                                  'fpbNumber',
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={editedAthletes[athlete.id!]?.active ?? true}
                              onChange={(e) =>
                                handleEditChange(athlete.id!, 'active', e.target.checked)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button onClick={() => handleSave(athlete.id!)} variant="contained">
                                {t('save')}
                              </Button>
                              <Button
                                onClick={() =>
                                  setEditMode((prev) => ({ ...prev, [athlete.id!]: false }))
                                }
                                variant="outlined"
                              >
                                {t('cancel')}
                              </Button>
                            </Stack>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{athlete.number}</TableCell>
                          <TableCell>{athlete.name}</TableCell>
                          <TableCell>{new Date(athlete.birthdate).toLocaleDateString()}</TableCell>
                          <TableCell>{athlete.fpbNumber || '—'}</TableCell>
                          <TableCell>{athlete.active ? t('yes') : t('no')}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="outlined"
                                onClick={() => handleEditToggle(athlete.id!)}
                              >
                                {t('edit')}
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => openDeleteDialog(athlete)}
                              >
                                {t('Delete')}
                              </Button>
                            </Stack>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default AthleteListComponent;
