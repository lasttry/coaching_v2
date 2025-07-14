'use client';

import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Grid } from '@mui/material';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useTranslation } from 'react-i18next';
import { GameInterface } from '@/types/games/types';
import { log } from '@/lib/logger';
import dayjs from 'dayjs';
import GameComponent from './Game';
import { useCallback } from 'react';
import { generatePDF } from '@/app/utilities/pdf/pdfUtils';
import { useSession } from 'next-auth/react';

interface GamesListProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GamesList: React.FC<GamesListProps> = ({
  setErrorMessage,
  setSuccessMessage,
  setLoading,
}) => {
  const { t } = useTranslation();
  const { data: session } = useSession();

  const [games, setGames] = useState<GameInterface[]>([]);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editMode, setEditMode] = useState<Record<number, boolean>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const gamesPerPage = 5;
  const totalPages = Math.ceil(games.length / gamesPerPage);

  const [editableGames, setEditableGames] = useState<Record<number, GameInterface>>({});

  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const gamesResponse = await fetch('/api/games');
      if (!gamesResponse.ok) {
        const gamesErrorData = await gamesResponse.json();
        throw new Error(gamesErrorData?.message || t('gameFetchError'));
      }
      const gamesData: GameInterface[] = await gamesResponse.json();

      const sortedGames = gamesData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setGames(sortedGames);
      log.debug(sortedGames)
    } catch (err) {
      log.error('Error fetching data:', err);
      setErrorMessage(`${t('fetchDataError')} ${err}`);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setGames, setErrorMessage, t]);

  // Fetch games and opponents
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Paginate games
  const currentGames = games.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number): void => {
    setCurrentPage(page);
  };

  const toggleEditMode = (id: number | undefined): void => {
    if (id === undefined) return;
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));

    if (!editMode[id]) {
      const gameToEdit = games.find((g) => g.id === id);
      if (gameToEdit) {
        setEditableGames((prev) => ({ ...prev, [id]: { ...gameToEdit } }));
      }
    }
  };

  const handleDeleteGame = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete game');
      }

      setSuccessMessage(t('GameDeletedSuccessfully'));
      await fetchData();
    } catch (error) {
      log.error('Error deleting game:', error);
      setErrorMessage(t('ErrorDeletingGame'));
    }
  };

  const handleSaveGame = async (game: GameInterface): Promise<void> => {
    if (!game || !game.id || game.id === null) return;
    const id = Number(game.id);

    try {
      const response = await fetch(`/api/games/${game.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || t('gameSaveError'));
      }

      setGames((prev) => prev.map((g) => (g.id === game.id ? data : g)));

      setEditMode((prev) => ({ ...prev, [id]: false }));
      setEditableGames((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      log.error('Error saving game:', err);
      setErrorMessage(`${t('gameSaveError')} ${err}`);
    }
  };

  const updateGame = (id: number, updated: React.SetStateAction<GameInterface>): void => {
    setEditableGames((prev) => ({
      ...prev,
      [id]: typeof updated === 'function' ? updated(prev[id]) : updated,
    }));
  };

  return (
    <>
      <DashboardCard title={t('gamesList')}>
        <Box>
          {currentGames.map((game) => (
            <Accordion key={game.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${game.id}-content`}
                id={`panel-${game.id}-header`}
              >
                <Box display="flex" alignItems="center" width="100%">
                  {game.opponent?.image && (
                    <img
                      src={game.opponent.image}
                      alt={game.opponent.name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        marginRight: '1rem',
                      }}
                    />
                  )}
                  <Typography>
                    {game.team?.name} - {game.number} -{' '}
                    {dayjs(game.date).format('YYYY-MM-DD HH:mm')} -{' '}
                    {game.opponent?.name || t('unknown')}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {game.id !== null && editMode[game.id] ? (
                  <GameComponent
                    game={editableGames[game.id]}
                    setGame={(g) => updateGame(game.id!, g)}
                    setErrorMessage={setErrorMessage}
                    setSuccessMessage={setSuccessMessage}
                    onSave={handleSaveGame}
                    onCancel={() => toggleEditMode(Number(game.id))}
                    saveText="Save"
                  ></GameComponent>
                ) : (
                  <Grid container spacing={2}>
                    <Grid
                      size={{ xs: 12, sm: 6 }}
                      sx={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <Typography>
                        <strong>{t('number')}:</strong> {game.number}
                      </Typography>
                    </Grid>
                    <Grid
                      size={{ xs: 12, sm: 6 }}
                      sx={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <Typography>
                        <strong>{t('date')}:</strong> {dayjs(game.date).format('YYYY-MM-DD HH:mm')}
                      </Typography>
                    </Grid>
                    <Grid
                      size={{ xs: 12, sm: 6 }}
                      sx={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <Typography>
                        <strong>{t('opponent')}:</strong> {game.opponent?.name || t('unknown')}
                      </Typography>
                    </Grid>
                    <Grid
                      size={{ xs: 12, sm: 6 }}
                      sx={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <Typography>
                        <strong>{t('venue')}:</strong> {game.venue?.name || t('none')}
                      </Typography>
                    </Grid>
                    <Grid
                      size={{ xs: 12, sm: 6 }}
                      sx={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <Typography>
                        <strong>{t('competition')}:</strong>
                        {game.competition?.name || t('na')} - {game.team?.echelon?.name}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Typography>
                        <strong>{t('notes')}:</strong> {game.notes || t('none')}
                      </Typography>
                    </Grid>
                    {game.gameAthletes?.length > 0 && (
                      <Grid size={12}>
                        <Typography variant="h6" gutterBottom>{t('Summoned Athletes')}</Typography>
                        {game.gameAthletes.map((ga) => (
                          <Box key={ga.athleteId} sx={{ mb: 1 }}>
                            <Typography>
                              <strong>{ga.athlete?.name}</strong> – #{ga.number}
                              {' '}·{' '}
                              {['period1', 'period2', 'period3', 'period4']
                                .filter((p) => ga[p as keyof typeof ga])
                                .map((p) => p.replace('period', 'P'))
                                .join(', ') || t('noPeriods')}
                            </Typography>
                          </Box>
                        ))}
                      </Grid>
                    )}
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={async () => {
                          const clubId = session?.user.selectedClubId;
                          await generatePDF(game, clubId);
                        }}
                      >
                        Folha de Jogo
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => toggleEditMode(game.id ?? undefined)}
                      >
                        {t('Edit')}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => setDeleteConfirmId(game.id)}
                        sx={{ ml: 1 }}
                      >
                        {t('Delete')}
                      </Button>
                    </Grid>
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box mt={2} display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </DashboardCard>
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('deleteConfirmationMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('cancel')}</Button>
          <Button
            onClick={async () => {
              if (deleteConfirmId !== null) {
                await handleDeleteGame(deleteConfirmId);
                setDeleteConfirmId(null);
              }
            }}
            color="error"
            variant="contained"
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GamesList;
