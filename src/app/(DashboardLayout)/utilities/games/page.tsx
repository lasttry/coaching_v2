'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { GameInterface } from '@/types/game/types';
import { log } from '@/lib/logger';
import GameComponent from './components/Game';
import { generatePDF, generateRegistrationPDF } from '@/app/utilities/pdf/pdfUtils';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface GroupedGames {
  [competitionName: string]: {
    [serieName: string]: GameInterface[];
  };
}

const GamesPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: session } = useSession();

  const [games, setGames] = useState<GameInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editGame, setEditGame] = useState<GameInterface | null>(null);
  const [expandedCompetition, setExpandedCompetition] = useState<string | false>(false);
  const [expandedSeries, setExpandedSeries] = useState<string | false>(false);
  const [initialExpandDone, setInitialExpandDone] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const [newGame, setNewGame] = useState<GameInterface>({
    id: null,
    date: new Date(),
    away: false,
    gameAthletes: [],
    clubId: 0,
  });

  // Get unique teams with game counts
  const teamsWithCounts = useMemo(() => {
    const teamMap = new Map<number, { id: number; name: string; count: number }>();

    games.forEach((game) => {
      if (game.team?.id) {
        const existing = teamMap.get(game.team.id);
        if (existing) {
          existing.count++;
        } else {
          teamMap.set(game.team.id, {
            id: game.team.id,
            name: game.team.name || t('unknownTeam'),
            count: 1,
          });
        }
      }
    });

    return Array.from(teamMap.values()).sort((a, b) => b.count - a.count);
  }, [games, t]);

  // Set default team to the one with most games
  useEffect(() => {
    if (selectedTeamId === null && teamsWithCounts.length > 0) {
      setSelectedTeamId(teamsWithCounts[0].id);
    }
  }, [teamsWithCounts, selectedTeamId]);

  // Filter games by selected team
  const filteredGames = useMemo(() => {
    if (selectedTeamId === null) return games;
    return games.filter((game) => game.team?.id === selectedTeamId);
  }, [games, selectedTeamId]);

  const groupedGames = useMemo((): GroupedGames => {
    const grouped: GroupedGames = {};

    filteredGames.forEach((game) => {
      const competitionName = game.competition?.name || t('noCompetition');
      const serieName = game.competitionSerie?.name || t('noSeries');

      if (!grouped[competitionName]) {
        grouped[competitionName] = {};
      }
      if (!grouped[competitionName][serieName]) {
        grouped[competitionName][serieName] = [];
      }
      grouped[competitionName][serieName].push(game);
    });

    // Sort games by date within each series
    Object.keys(grouped).forEach((comp) => {
      Object.keys(grouped[comp]).forEach((serie) => {
        grouped[comp][serie].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });
    });

    return grouped;
  }, [filteredGames, t]);

  // Find and expand the competition/series of the nearest game (based on filtered games)
  useEffect(() => {
    if (initialExpandDone || filteredGames.length === 0 || selectedTeamId === null) return;

    const now = new Date().getTime();

    // Find nearest future game, or most recent past game if no future games
    const futureGames = filteredGames.filter((g) => new Date(g.date).getTime() >= now);
    const pastGames = filteredGames.filter((g) => new Date(g.date).getTime() < now);

    let nearestGame: GameInterface | null = null;

    if (futureGames.length > 0) {
      nearestGame = futureGames.reduce((closest, game) => {
        const gameTime = new Date(game.date).getTime();
        const closestTime = new Date(closest.date).getTime();
        return gameTime < closestTime ? game : closest;
      });
    } else if (pastGames.length > 0) {
      nearestGame = pastGames.reduce((mostRecent, game) => {
        const gameTime = new Date(game.date).getTime();
        const mostRecentTime = new Date(mostRecent.date).getTime();
        return gameTime > mostRecentTime ? game : mostRecent;
      });
    }

    if (nearestGame) {
      const competitionName = nearestGame.competition?.name || t('noCompetition');
      const serieName = nearestGame.competitionSerie?.name || t('noSeries');

      setExpandedCompetition(competitionName);
      setExpandedSeries(`${competitionName}-${serieName}`);
    }

    setInitialExpandDone(true);
  }, [filteredGames, initialExpandDone, selectedTeamId, t]);

  const fetchGames = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch('/api/games');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to fetch games');
      setGames(
        data.games.sort(
          (a: GameInterface, b: GameInterface) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (err) {
      log.error('Error fetching games:', err);
      setErrorMessage(t('ErrorFetchingGames'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleDeleteGame = async (id: number): Promise<void> => {
    try {
      const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSuccessMessage(t('GameDeletedSuccessfully'));
      fetchGames();
    } catch (err) {
      log.error('Error deleting game:', err);
      setErrorMessage(t('ErrorDeletingGame'));
    }
  };

  const handleAddGame = async (game: GameInterface): Promise<void> => {
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save game');
      setSuccessMessage(t('GameCreatedSuccessfully'));

      // reset state
      setOpenAddDialog(false);
      setNewGame({ id: null, date: new Date(), away: false, gameAthletes: [], clubId: 0 });

      fetchGames();
    } catch (err) {
      log.error('Error creating game:', err);
      setErrorMessage(t('ErrorCreatingGame'));
    }
  };

  const handleUpdateGame = async (game: GameInterface): Promise<void> => {
    try {
      const res = await fetch(`/api/games/${game.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to update game');
      setSuccessMessage(t('GameUpdatedSuccessfully'));

      setEditGame(null); // fecha dialog
      fetchGames(); // refaz lista
    } catch (err) {
      log.error('Error updating game:', err);
      setErrorMessage(t('ErrorUpdatingGame'));
    }
  };

  const getGameCount = (competitionName: string): number => {
    const series = groupedGames[competitionName];
    return Object.values(series).reduce((acc, games) => acc + games.length, 0);
  };

  const handleTeamChange = (teamId: number) => {
    setSelectedTeamId(teamId);
    setExpandedCompetition(false);
    setExpandedSeries(false);
    setInitialExpandDone(false);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          {t('gamesManagement')}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenAddDialog(true)}>
          {t('addGame')}
        </Button>
      </Box>

      {teamsWithCounts.length > 0 && (
        <FormControl sx={{ mb: 2, minWidth: 250 }} size="small">
          <InputLabel id="team-filter-label">{t('Team')}</InputLabel>
          <Select
            labelId="team-filter-label"
            value={selectedTeamId ?? ''}
            label={t('Team')}
            onChange={(e) => handleTeamChange(Number(e.target.value))}
          >
            {teamsWithCounts.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name} ({team.count} {t('games')})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

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

      {loading ? (
        <Typography>{t('loading')}...</Typography>
      ) : Object.keys(groupedGames).length === 0 ? (
        <Typography color="text.secondary">{t('noGamesFound')}</Typography>
      ) : (
        Object.keys(groupedGames)
          .sort()
          .map((competitionName) => (
            <Accordion
              key={competitionName}
              expanded={expandedCompetition === competitionName}
              onChange={(_, isExpanded) => {
                setExpandedCompetition(isExpanded ? competitionName : false);
                setExpandedSeries(false);
              }}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <Typography variant="h6" fontWeight="bold">
                    {competitionName}
                  </Typography>
                  <Chip
                    label={`${getGameCount(competitionName)} ${t('games')}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {Object.keys(groupedGames[competitionName])
                  .sort()
                  .map((serieName) => (
                    <Accordion
                      key={`${competitionName}-${serieName}`}
                      expanded={expandedSeries === `${competitionName}-${serieName}`}
                      onChange={(_, isExpanded) =>
                        setExpandedSeries(isExpanded ? `${competitionName}-${serieName}` : false)
                      }
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography fontWeight="medium">{serieName}</Typography>
                          <Chip
                            label={`${groupedGames[competitionName][serieName].length} ${t('games')}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>{t('number')}</TableCell>
                                <TableCell>{t('date')}</TableCell>
                                <TableCell>{t('Team')}</TableCell>
                                <TableCell>{t('Opponent')}</TableCell>
                                <TableCell>{t('Venue')}</TableCell>
                                <TableCell align="right">{t('actions')}</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {groupedGames[competitionName][serieName].map((game) => (
                                <TableRow key={game.id} hover>
                                  <TableCell>{game.number || '-'}</TableCell>
                                  <TableCell>
                                    {game.date ? dayjs(game.date).format('DD/MM/YYYY HH:mm') : '-'}
                                  </TableCell>
                                  <TableCell>{game.team?.name || '-'}</TableCell>
                                  <TableCell>{game.opponent?.name || '-'}</TableCell>
                                  <TableCell>{game.venue?.name || '-'}</TableCell>
                                  <TableCell align="right">
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      title={t('gameSheet')}
                                      onClick={() =>
                                        session?.user.selectedClubId &&
                                        generatePDF(game, session.user.selectedClubId)
                                      }
                                    >
                                      <PictureAsPdfIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="secondary"
                                      title={t('registrationSheet')}
                                      onClick={() => generateRegistrationPDF(game)}
                                      disabled={!game.teamId}
                                    >
                                      <AssignmentIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      title={t('edit')}
                                      onClick={() => setEditGame(game)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      title={t('delete')}
                                      onClick={() => setDeleteConfirmId(Number(game.id))}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  ))}
              </AccordionDetails>
            </Accordion>
          ))
      )}

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('deleteConfirmationMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('cancel')}</Button>
          <Button
            onClick={() => {
              if (deleteConfirmId !== null) {
                handleDeleteGame(deleteConfirmId);
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

      {/* Add Game Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('addGame')}</DialogTitle>
        <DialogContent>
          <GameComponent
            game={newGame}
            setGame={setNewGame} // ✅ agora o state é real
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
            onSave={handleAddGame}
            onCancel={() => setOpenAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Game Dialog */}
      <Dialog open={!!editGame} onClose={() => setEditGame(null)} maxWidth="md" fullWidth>
        <DialogTitle>{t('editGame')}</DialogTitle>
        <DialogContent>
          {editGame && (
            <GameComponent
              game={editGame}
              setGame={setEditGame as React.Dispatch<React.SetStateAction<GameInterface>>}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              onSave={handleUpdateGame}
              onCancel={() => setEditGame(null)}
              saveText={t('Save')}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GamesPage;
