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
} from '@mui/material';
import Image from 'next/image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { CompetitionInterface } from '@/types/competition/types';
import { isNumber } from 'lodash';
import { EchelonInterface } from '@/types/echelons/types';

interface CompetitionListProps {
  echelons: EchelonInterface[];

  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  competitions: CompetitionInterface[] | null;
  setEditedCompetitions: React.Dispatch<React.SetStateAction<{ [key: number]: CompetitionInterface }>>;
  editedCompetitions: { [key: number]: CompetitionInterface };
  onSaveCompetition: (id: number) => void;
  onDeleteCompetition: (id: number) => void;
}

const CompetitionListComponent: React.FC<CompetitionListProps> = ({
  setErrorMessage,
  competitions,
  setEditedCompetitions,
  editedCompetitions,
  echelons,
  onSaveCompetition,
  onDeleteCompetition,
}) => {
  const { t } = useTranslation();

  const [editMode, setEditMode] = React.useState<{ [key: number]: boolean }>({});
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);

  const toggleEditMode = (id: number | null): undefined => {
    if (!id) return;
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveCompetition = (id: number | null): undefined => {
    if (!id) return;
    if (onSaveCompetition) onSaveCompetition(id);

    toggleEditMode(id);
  };

  const handleDeleteCompetition = (id: number | null): undefined => {
    if (!id) {
      setErrorMessage('No competition ID defined.');
      return;
    }
    setDeleteConfirm(id); // Show confirmation dialog
  };

  const handleCancelEdit = (id: number | null): undefined => {
    if (!id) return;
    toggleEditMode(id); // Alternar o modo de edição
    setEditedCompetitions((prev) => {
      const updated = { ...prev };
      delete updated[id]; // Remove os dados editados desta competição
      return updated;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, id: number | null): undefined => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedCompetitions((prev) => ({
          ...prev,
          [Number(id)]: {
            ...prev[Number(id)],
            image: reader.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
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
                onDeleteCompetition(deleteConfirm);
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
      {/* Existing Competitions */}
      {competitions &&
        competitions.map((competition) => (
          <Accordion key={competition.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                  {isNumber(competition.id) && (editedCompetitions[competition.id]?.image || competition?.image) && (
                    <Image
                      src={editedCompetitions[competition.id]?.image || competition?.image || ''}
                      alt={competition?.name || 'Competition Image'}
                      width={50}
                      height={50}
                    />
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'left' }}>
                  <Typography>{competition.name}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', justifyContent: 'right' }}>
                  <Typography>{competition.echelon?.name}</Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              {isNumber(competition.id) && editMode[competition.id] ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TextField
                      label={t('name')}
                      value={editedCompetitions[competition.id]?.name || competition.name}
                      onChange={(e) =>
                        setEditedCompetitions((prev) => ({
                          ...prev,
                          [Number(competition.id)]: {
                            ...prev[Number(competition.id)],
                            name: e.target.value,
                          },
                        }))
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TextField
                      label={t('description')}
                      value={editedCompetitions[competition.id]?.description || competition.description}
                      onChange={(e) =>
                        setEditedCompetitions((prev) => ({
                          ...prev,
                          [Number(competition.id)]: {
                            ...prev[Number(competition.id)],
                            description: e.target.value,
                          },
                        }))
                      }
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Select
                      value={editedCompetitions[competition.id]?.echelonId || competition.echelonId}
                      onChange={(e) =>
                        setEditedCompetitions((prev) => ({
                          ...prev,
                          [Number(competition.id)]: {
                            ...prev[Number(competition.id)],
                            echelonId: Number(e.target.value),
                          },
                        }))
                      }
                      fullWidth
                    >
                      {echelons
                        .filter((echelon) => typeof echelon.id === 'number') // Apenas ids válidos
                        .map((echelon) => (
                          <MenuItem key={echelon.id} value={Number(echelon.id)}>
                            {echelon.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="outlined" component="label">
                      {t('uploadImage')}
                      <input type="file" hidden onChange={(e) => handleImageChange(e, competition.id)} />
                    </Button>
                    <Button
                      variant="contained"
                      sx={{ marginLeft: 2 }}
                      onClick={() => handleSaveCompetition(competition.id)}
                      disabled={!editedCompetitions[competition.id] || Object.keys(editedCompetitions[competition.id]).length === 0}
                    >
                      {t('save')}
                    </Button>
                    <Button variant="outlined" sx={{ marginLeft: 2 }} onClick={() => handleCancelEdit(competition.id)}>
                      {t('cancel')}
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'left' }}>
                    <Typography>{competition.description}</Typography>
                  </Grid>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      toggleEditMode(competition.id);
                    }}
                  >
                    {t('edit')}
                  </Button>
                  <Button variant="contained" color="error" sx={{ marginLeft: 2 }} onClick={() => handleDeleteCompetition(competition.id)}>
                    {t('Delete')}
                  </Button>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
    </>
  );
};

CompetitionListComponent.displayName = 'Competition List';
export default CompetitionListComponent;
