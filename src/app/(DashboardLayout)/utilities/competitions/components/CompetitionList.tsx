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
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import Image from 'next/image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { CompetitionInterface } from '@/types/competition/types';
import { EchelonInterface } from '@/types/echelons/types';

interface CompetitionListProps {
  echelons: EchelonInterface[];
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  competitions: CompetitionInterface[] | null;
  setEditedCompetitions: React.Dispatch<
    React.SetStateAction<{ [key: number]: CompetitionInterface }>
  >;
  editedCompetitions: { [key: number]: CompetitionInterface };
  onSaveCompetition: (id: number) => void;
  onDeleteCompetition: (id: number) => void;
}

const CompetitionListComponent: React.FC<CompetitionListProps> = ({
  echelons,
  setErrorMessage,
  setSuccessMessage,
  competitions,
  setEditedCompetitions,
  editedCompetitions,
  onSaveCompetition,
  onDeleteCompetition,
}) => {
  const { t } = useTranslation();
  const [editMode, setEditMode] = React.useState<{ [key: number]: boolean }>({});
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null);
  const [newSeries, setNewSeries] = React.useState<{ [key: number]: string }>({});

  const toggleEditMode = (id: number): void => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCancelEdit = (id: number): void => {
    toggleEditMode(id);
    setEditedCompetitions((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleSaveCompetition = (id: number): void => {
    toggleEditMode(id);
    if (onSaveCompetition) onSaveCompetition(id);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, id: number): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedCompetitions((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
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

      {competitions &&
        competitions?.map((competition) => {
          if (competition.id === null) return;

          const isEditing = editMode[competition.id];
          const edited = editedCompetitions[competition.id] ?? competition;

          return (
            <Accordion key={competition.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={2}>
                    {edited.image && (
                      <Image src={edited.image} alt={edited.name} width={50} height={50} />
                    )}
                  </Grid>
                  <Grid size={7}>
                    <Typography>{edited.name}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography>{edited.echelon?.name}</Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>

              <AccordionDetails>
                {isEditing ? (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label={t('name')}
                        value={edited.name}
                        onChange={(e) =>
                          setEditedCompetitions((prev) => ({
                            ...prev,
                            [competition.id]: {
                              ...prev[competition.id],
                              name: e.target.value,
                            },
                          }))
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label={t('description')}
                        value={edited.description ?? ''}
                        onChange={(e) =>
                          setEditedCompetitions((prev) => ({
                            ...prev,
                            [competition.id]: {
                              ...prev[competition.id],
                              description: e.target.value,
                            },
                          }))
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>{t('echelon')}</InputLabel>
                        <Select
                          value={edited.echelonId}
                          onChange={(e) =>
                            setEditedCompetitions((prev) => ({
                              ...prev,
                              [competition.id]: {
                                ...prev[competition.id],
                                echelonId: Number(e.target.value),
                              },
                            }))
                          }
                        >
                          {echelons.map((e) => (
                            <MenuItem key={e.id} value={e.id}>
                              {e.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={12}>
                      <Typography sx={{ mb: 1 }}>{t('series')}</Typography>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {edited.competitionSeries?.map((serie) => (
                          <li
                            key={serie.id}
                            style={{ display: 'flex', justifyContent: 'space-between' }}
                          >
                            <span>{serie.name}</span>
                            <Button
                              size="small"
                              color="error"
                              onClick={() =>
                                setEditedCompetitions((prev) => ({
                                  ...prev,
                                  [competition.id]: {
                                    ...prev[competition.id],
                                    competitionSeries: prev[
                                      competition.id
                                    ].competitionSeries.filter((s) => s.id !== serie.id),
                                  },
                                }))
                              }
                            >
                              {t('remove')}
                            </Button>
                          </li>
                        ))}
                      </ul>

                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid size={8}>
                          <TextField
                            fullWidth
                            label={t('newSerie')}
                            value={newSeries[competition.id] || ''}
                            onChange={(e) =>
                              setNewSeries((prev) => ({
                                ...prev,
                                [competition.id]: e.target.value,
                              }))
                            }
                          />
                        </Grid>
                        <Grid size={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                              const name = newSeries[competition.id]?.trim();
                              if (!name) return;

                              const newId = Date.now(); // temporary ID
                              setEditedCompetitions((prev) => {
                                if (competition.id === null) return;
                                const base =
                                  prev[competition.id] ??
                                  competitions?.find((c) => c.id === competition.id);

                                if (!base) return prev; // safely fallback

                                return {
                                  ...prev,
                                  [competition.id]: {
                                    ...base,
                                    competitionSeries: [
                                      ...(base.competitionSeries || []),
                                      { id: Date.now(), name }, // temporary new series
                                    ],
                                  },
                                };
                              });

                              setNewSeries((prev) => ({ ...prev, [competition.id]: '' }));
                            }}
                          >
                            {t('add')}
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>

                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button variant="outlined" component="label">
                        {t('uploadImage')}
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleImageChange(e, competition.id)}
                        />
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ ml: 2 }}
                        onClick={() => handleSaveCompetition(competition.id)}
                      >
                        {t('save')}
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ ml: 2 }}
                        onClick={() => handleCancelEdit(competition.id)}
                      >
                        {t('cancel')}
                      </Button>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Typography>{competition.description}</Typography>
                    </Grid>
                    <Grid
                      size={{ xs: 12, sm: 4 }}
                      sx={{ display: 'flex', justifyContent: 'flex-end' }}
                    >
                      <Button variant="outlined" onClick={() => toggleEditMode(competition.id)}>
                        {t('edit')}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        sx={{ ml: 2 }}
                        onClick={() => setDeleteConfirm(competition.id)}
                      >
                        {t('Delete')}
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
    </>
  );
};

export default CompetitionListComponent;
