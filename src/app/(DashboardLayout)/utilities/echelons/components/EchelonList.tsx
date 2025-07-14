'use client';

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { EchelonInterface } from '@/types/echelons/types';
import { Gender } from '@prisma/client';

interface EchelonListProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  echelons: Record<string, EchelonInterface[]>;
  setEditedEchelons: React.Dispatch<React.SetStateAction<{ [key: number]: EchelonInterface }>>;
  editedEchelons: { [key: number]: EchelonInterface };
  onSaveEchelon: (id: number) => void;
  onDeleteEchelon: (id: number) => void;
}

const EchelonListComponent: React.FC<EchelonListProps> = ({
  setErrorMessage,
  echelons,
  setEditedEchelons,
  editedEchelons,
  onSaveEchelon,
  onDeleteEchelon,
}) => {
  const { t } = useTranslation();

  const [editMode, setEditMode] = React.useState<{ [key: number]: boolean }>({});
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);

  const toggleEditMode = (id: number | null): void => {
    if (!id) return;
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveEchelon = (id: number | null): void => {
    if (!id) return;
    onSaveEchelon(id);
    toggleEditMode(id);
  };

  const handleDeleteEchelon = (id: number | null): void => {
    if (!id) {
      setErrorMessage('No echelon ID defined.');
      return;
    }
    setDeleteConfirm(id);
  };

  const handleCancelEdit = (id: number | null): void => {
    if (!id) return;
    toggleEditMode(id);
    setEditedEchelons((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  return (
    <>
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('deleteConfirmationMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>{t('Cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteConfirm !== null) {
                onDeleteEchelon(deleteConfirm);
                setDeleteConfirm(null);
              }
            }}
            color="error"
            variant="contained"
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper} sx={{ marginTop: 4 }}>
        {Object.entries(echelons).map(([gender, echelonList]) => (
          <Accordion key={gender} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t(gender)}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('name')}</TableCell>
                    <TableCell>{t('minAge')}</TableCell>
                    <TableCell>{t('maxAge')}</TableCell>
                    <TableCell>{t('gender')}</TableCell>
                    <TableCell>{t('description')}</TableCell>
                    <TableCell>{t('actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {echelonList
                    .filter((echelon) => echelon.id !== null) // ✅ Filter out null IDs before mapping
                    .map((echelon) => {
                      const id = echelon.id as number;
                      return (
                        <TableRow key={id}>
                          {editMode[id] ? (
                            <>
                              <TableCell>
                                <TextField
                                  value={editedEchelons[id]?.name || echelon.name}
                                  onChange={(e) =>
                                    setEditedEchelons((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...prev[id],
                                        name: e.target.value,
                                      },
                                    }))
                                  }
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  value={editedEchelons[id]?.minAge ?? echelon.minAge} // ✅ Allow empty input
                                  onChange={(e) => {
                                    const value =
                                      e.target.value === '' ? null : Number(e.target.value); // ✅ Handle empty input
                                    setEditedEchelons((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...prev[id],
                                        minAge: value,
                                      },
                                    }));
                                  }}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  value={editedEchelons[id]?.maxAge || echelon.maxAge}
                                  onChange={(e) =>
                                    setEditedEchelons((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...prev[id],
                                        maxAge: Number(e.target.value),
                                      },
                                    }))
                                  }
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={editedEchelons[id]?.gender || echelon.gender}
                                  onChange={(e) =>
                                    setEditedEchelons((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...prev[id],
                                        gender: e.target.value as Gender,
                                      },
                                    }))
                                  }
                                  fullWidth
                                >
                                  {Object.entries(Gender).map(([key, value]) => (
                                    <MenuItem key={key} value={value}>
                                      {t(key)}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </TableCell>
                              <TableCell>
                                <TextField
                                  value={editedEchelons[id]?.description || echelon.description}
                                  onChange={(e) =>
                                    setEditedEchelons((prev) => ({
                                      ...prev,
                                      [id]: {
                                        ...prev[id],
                                        description: e.target.value,
                                      },
                                    }))
                                  }
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  onClick={() => handleSaveEchelon(echelon.id)}
                                >
                                  {t('save')}
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={() => handleCancelEdit(echelon.id)}
                                  sx={{ ml: 1 }}
                                >
                                  {t('cancel')}
                                </Button>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{echelon.name}</TableCell>
                              <TableCell>{echelon.minAge}</TableCell>
                              <TableCell>{echelon.maxAge}</TableCell>
                              <TableCell>{t(echelon.gender || 'Unknown')}</TableCell>
                              <TableCell>{echelon.description}</TableCell>
                              <TableCell>
                                <Button
                                  variant="outlined"
                                  onClick={() => toggleEditMode(echelon.id)}
                                >
                                  {t('edit')}
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleDeleteEchelon(echelon.id)}
                                  sx={{ ml: 1 }}
                                >
                                  {t('Delete')}
                                </Button>
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
        ))}
      </TableContainer>
    </>
  );
};

EchelonListComponent.displayName = 'EchelonListComponent';
export default EchelonListComponent;
