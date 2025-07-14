'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Box,
  Alert,
  Modal,
  CircularProgress,
} from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { GameInterface } from '@/types/games/types';
import GameFormPage from './manage/[id]/page'; // Make sure the path is correct
import { log } from '@/lib/logger';

const GamesList = (): ReactElement => {
  const { t } = useTranslation();

  const [games, setGames] = useState<GameInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentGame, setCurrentGame] = useState<GameInterface | null>(null);

  // Fetch games
  useEffect(() => {
    const fetchGames = async (): Promise<void> => {
      try {
        const response = await fetch('/api/games');
        if (!response.ok) {
          throw new Error(t('gameFetchError'));
        }
        const data: GameInterface[] = await response.json();
        setGames(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        log.error(error);
        setErrorMessage(t('gameFetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [t]);

  // Delete game
  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm(t('confirmDeleteGame', { id }))) return;

    try {
      const response = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setGames((prev) => prev.filter((game) => game.id !== id));
        setSuccessMessage(t('gameDeletedSuccess', { id }));
      } else {
        throw new Error();
      }
    } catch {
      setErrorMessage(t('gameDeleteFailed'));
    }
  };

  // Open modal for add/edit
  const handleOpenModal = (game: GameInterface | null): void => {
    setCurrentGame(game);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setCurrentGame(null);
  };

  return (
    <PageContainer title={t('games')} description={t('gamesList')}>
      <h1>{t('games')}</h1>
      <Button variant="contained" color="primary" onClick={() => handleOpenModal(null)}>
        {t('addNewGame')}
      </Button>

      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <DashboardCard title={t('gamesList')}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('date')}</TableCell>
                <TableCell>{t('opponent')}</TableCell>
                <TableCell>{t('competition')}</TableCell>
                <TableCell>{t('away')}</TableCell>
                <TableCell align="right">{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell>{dayjs(game.date).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>{game.oponent?.name || t('unknown')}</TableCell>
                  <TableCell>{game.competition || t('na')}</TableCell>
                  <TableCell>{game.away ? t('yes') : t('no')}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenModal(game)}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDelete(game.id)}
                      >
                        {t('delete')}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardCard>
      )}

      {/* Modal for Add/Edit Game */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            maxHeight: '90vh', // Ensure the modal doesn't exceed the viewport height
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            overflow: 'auto', // Enable scrolling when content exceeds maxHeight
            borderRadius: 2, // Add a slight rounding for better appearance
          }}
        >
          <Typography variant="h6">{currentGame ? t('editGame') : t('addGame')}</Typography>
          <GameFormPage
            params={Promise.resolve({
              id: currentGame ? currentGame.id.toString() : 'new',
            })}
          />
        </Box>
      </Modal>
    </PageContainer>
  );
};

export default GamesList;
