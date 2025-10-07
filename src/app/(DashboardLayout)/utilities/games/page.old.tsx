'use client';

import React, { useState, useEffect, ReactElement, useCallback } from 'react';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import GamesList from './components/GamesList';
import GamesAddComponent from './components/GamesAdd';
import { GameInterface } from '@/types/games/types';
import { useTranslation } from 'react-i18next';
import { log } from '@/lib/logger';

const GamesPage = (): ReactElement => {
  const { t } = useTranslation();

  const [errorMessage, setErrorMessageRaw] = useState<string | null>(null);
  const setErrorMessage = useCallback<React.Dispatch<React.SetStateAction<string | null>>>(
    (msg) => {
      setErrorMessageRaw(msg);
    },
    []
  );
  const [successMessage, setSuccessMessageRaw] = useState<string | null>(null);
  const setSuccessMessage = useCallback<React.Dispatch<React.SetStateAction<string | null>>>(
    (msg) => {
      setSuccessMessageRaw(msg);
    },
    []
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [showGameList, setShowGameList] = useState<boolean>(true);

  const handleAddGame = async (game: GameInterface): Promise<void> => {
    if (game === null || game === undefined) {
      log.error('NoGameToAdd');
      return;
    }
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(game),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save the game.');
      }

      setSuccessMessage(t('GameCreatedSuccessfully'));
      setShowGameList(false); // Hide and reload list if needed
      setTimeout(() => setShowGameList(true), 500); // Short timeout to refresh list
    } catch (error) {
      console.error('Error saving game:', error);
      setErrorMessage(t('ErrorSavingGame'));
    }
  };

  useEffect(() => {
    setShowGameList(true);
  }, [showGameList]);

  return (
    <PageContainer title="Games" description="Manage all games">
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Games Management
        </Typography>

        {/* Display error message */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        {/* Display loading spinner */}
        {loading && <CircularProgress />}

        <GamesAddComponent
          setErrorMessage={setErrorMessage}
          setSuccessMessage={setSuccessMessage}
          onAddGame={handleAddGame}
        />

        {/* Games list */}
        {showGameList && (
          <GamesList
            setErrorMessage={setErrorMessage}
            setSuccessMessage={setSuccessMessage}
            setLoading={setLoading}
          />
        )}
      </Box>
    </PageContainer>
  );
};

export default GamesPage;
