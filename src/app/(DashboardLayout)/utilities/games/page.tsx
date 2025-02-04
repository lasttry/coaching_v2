'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import GamesList from './components/GamesList';

const GamesPage = (): ReactElement => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showGameList, setShowGameList] = useState<boolean>(true);

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

        {/* Display loading spinner */}
        {loading && <CircularProgress />}

        {/* Games list */}
        {showGameList && <GamesList setErrorMessage={setErrorMessage} setLoading={setLoading} />}
      </Box>
    </PageContainer>
  );
};

export default GamesPage;
