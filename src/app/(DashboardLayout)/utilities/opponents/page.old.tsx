'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Box, Divider, Typography } from '@mui/material';
import OpponentAddComponent from './components/OpponentAdd';
import OpponentListComponent from './components/OpponentsList';

import { useTranslation } from 'react-i18next';
import { useMessage } from '@/hooks/useMessage';
import { OpponentInterface } from '@/types/games/types';

const OpponentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);
  const [opponents, setOpponents] = useState<OpponentInterface[]>([]);
  const [newOpponent, setNewOpponent] = useState<OpponentInterface>({
    name: '',
    shortName: '',
    image: undefined,
    venues: [],
  });

  const fetchOpponents = async () => {
    const res = await fetch('/api/opponents');
    const data = await res.json();
    setOpponents(data);
  };

  useEffect(() => {
    fetchOpponents();
  }, []);

  const handleAddOponent = async (): Promise<void> => {
    try {
      const response = await fetch('/api/opponents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOpponent),
      });
      if (!response.ok) throw new Error(await response.text());
      setNewOpponent({ name: '', shortName: '', venues: [] });
      fetchOpponents();
    } catch (err) {
      setErrorMessage(`${t('opponentFailedSave')} ${err}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  }

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
        onAddOpponent={handleAddOponent}
        opponent={newOpponent}
        setOpponent={setNewOpponent}
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