'use client';

import React, { useEffect, useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, TextField, Button, Pagination, Select, MenuItem } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid2';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useTranslation } from 'react-i18next';
import { GameInterface, OpponentInterface } from '@/types/games/types';
import { log } from '@/lib/logger';
import dayjs from 'dayjs';

interface GamesListProps {
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const GamesList: React.FC<GamesListProps> = ({ setErrorMessage, setLoading }) => {
  const { t } = useTranslation();

  const [games, setGames] = useState<GameInterface[]>([]);
  const [opponents, setOpponents] = useState<OpponentInterface[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [editMode, setEditMode] = useState<Record<number, boolean>>({});
  const [editedGames, setEditedGames] = useState<Record<number, Partial<GameInterface>>>({});

  const gamesPerPage = 5;
  const totalPages = Math.ceil(games.length / gamesPerPage);

  // Fetch games and opponents
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        // Fetch games
        const gamesResponse = await fetch('/api/games');
        if (!gamesResponse.ok) {
          const gamesErrorData = await gamesResponse.json();
          throw new Error(gamesErrorData?.message || t('gameFetchError'));
        }
        const gamesData: GameInterface[] = await gamesResponse.json();

        // Fetch opponents
        const opponentsResponse = await fetch('/api/opponents');
        if (!opponentsResponse.ok) {
          const opponentsErrorData = await opponentsResponse.json();
          throw new Error(opponentsErrorData?.message || t('opponentsFetchError'));
        }
        const opponentsData: OpponentInterface[] = await opponentsResponse.json();

        // Sort games and opponents
        const sortedGames = gamesData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const sortedOpponents = opponentsData.sort((a, b) => a.name.localeCompare(b.name));

        setGames(sortedGames);
        setOpponents(sortedOpponents);
        log.debug('Fetched and sorted games and opponents.');
      } catch (err) {
        log.error('Error fetching data:', err);
        setErrorMessage(`${t('fetchDataError')} ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setErrorMessage, setLoading, t]);

  // Paginate games
  const currentGames = games.slice((currentPage - 1) * gamesPerPage, currentPage * gamesPerPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number): void => {
    setCurrentPage(page);
  };

  const toggleEditMode = (id: number | undefined): void => {
    if (id === undefined) return;
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFieldChange = (id: number | undefined, field: keyof GameInterface, value: string | number): void => {
    if (id === undefined) return;

    setEditedGames((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const saveGameChanges = async (id: number | undefined): Promise<void> => {
    if (id === undefined) return;
    const updatedData = editedGames[id] || { id };
    try {
      const response = await fetch(`/api/games/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || t('gameSaveError'));
      }
      const data = await response.json();
      setGames((prev) => prev.map((game) => (game.id === id ? { ...game, ...data } : game)));
      toggleEditMode(id);
    } catch (err) {
      log.error('Error saving game changes:', err);
      setErrorMessage(`${t('gameSaveError')} ${err}`);
    }
  };

  return (
    <DashboardCard title={t('gamesList')}>
      <Box>
        {currentGames.map((game) => (
          <Accordion key={game.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`panel-${game.id}-content`} id={`panel-${game.id}-header`}>
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
                  {game.number} - {dayjs(game.date).format('YYYY-MM-DD HH:mm')} - {game.opponent?.name || t('unknown')}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {game.id !== undefined && editMode[game.id] ? (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TextField
                      label={t('number')}
                      type="number"
                      required
                      fullWidth
                      value={editedGames[game.id]?.number || game.number || ''}
                      onChange={(e) => handleFieldChange(game.id, 'number', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TextField
                      label={t('date')}
                      type="datetime-local"
                      fullWidth
                      value={editedGames[game.id]?.date || dayjs(game.date).format('YYYY-MM-DDTHH:mm')}
                      onChange={(e) => handleFieldChange(game.id, 'date', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Select
                      label={t('opponent')}
                      fullWidth
                      value={editedGames[game.id]?.opponentId || game.opponentId || ''}
                      onChange={(e) => handleFieldChange(game.id, 'opponentId', e.target.value)}
                    >
                      {opponents.map((opponent) => (
                        <MenuItem key={opponent.id} value={opponent.id}>
                          {opponent.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TextField
                      label={t('competition')}
                      fullWidth
                      value={editedGames[game.id]?.competition || game.competition}
                      onChange={(e) => handleFieldChange(game.id, 'competition', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TextField
                      label={t('notes')}
                      fullWidth
                      multiline
                      rows={3}
                      value={editedGames[game.id]?.notes || game.notes || ''}
                      onChange={(e) => handleFieldChange(game.id, 'notes', e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary" onClick={() => saveGameChanges(game.id)}>
                      {t('save')}
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => toggleEditMode(game.id)} sx={{ ml: 2 }}>
                      {t('cancel')}
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography>
                      <strong>{t('number')}:</strong> {game.number}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography>
                      <strong>{t('date')}:</strong> {dayjs(game.date).format('YYYY-MM-DD HH:mm')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography>
                      <strong>{t('opponent')}:</strong> {game.opponent?.name || t('unknown')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography>
                      <strong>{t('competition')}:</strong> {game.competition || t('na')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography>
                      <strong>{t('notes')}:</strong> {game.notes || t('none')}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" color="primary" onClick={() => toggleEditMode(game.id)}>
                      {t('edit')}
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
          <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </DashboardCard>
  );
};

export default GamesList;
