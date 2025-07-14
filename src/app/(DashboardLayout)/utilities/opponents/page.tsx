'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Box, Divider, Typography } from '@mui/material';
import OpponentAddComponent from './components/OpponentAdd';
import OpponentListComponent from './components/OpponentsList';

import { useTranslation } from 'react-i18next';
import { useMessage } from '@/hooks/useMessage';
import { OpponentInterface } from '@/types/games/types';

const OpponentsPage = () => {
  const { t } = useTranslation();
  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);
  const [opponents, setOpponents] = useState<OpponentInterface[]>([]);

  useEffect(() => {
    const fetchOpponents = async () => {
      const res = await fetch('/api/opponents');
      const data = await res.json();
      setOpponents(data);
    };
    fetchOpponents();
  }, []);

  return (

    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        {t('opponentManagement')}
      </Typography>

      {successMessage ? <Alert severity="success">{successMessage}</Alert> : <></>}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : <></>}

      <OpponentAddComponent
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        onAddOpponent={() => {}}
      />

      <Divider sx={{ my: 4 }} />

      <OpponentListComponent
        setSuccessMessage={setSuccessMessage}
        setErrorMessage={setErrorMessage}
        opponents={opponents}
        setOpponents={setOpponents}
      />
    </Box>

  );
};

export default OpponentsPage;