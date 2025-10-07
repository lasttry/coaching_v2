'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';
import { AthleteInterface } from '@/types/games/types';
import AthleteAddComponent from './components/AthleteAddComponent';
import AthleteListComponent from './components/AthleteListComponent';
import { useMessage } from '@/hooks/useMessage';

const AthletesPage: React.FC = () => {
  const { t } = useTranslation();
  const [athletes, setAthletes] = useState<AthleteInterface[]>([]);
  const [newAthlete, setNewAthlete] = useState<AthleteInterface>({
    id: null,
    number: '',
    name: '',
    birthdate: '',
    fpbNumber: null,
    active: true,
  });

  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(10000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);

  const fetchAthletes = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/athletes');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to fetch athletes.');
      }
      setAthletes(data);
    } catch (err) {
      log.error('Error fetching athletes:', err);
      setErrorMessage(t('failedFetchAthlete'));
    }
  }, [t]);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);

  const handleAddAthlete = async (): Promise<void> => {
    try {
      const response = await fetch('/api/athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAthlete),
      });

      const added = await response.json();
      if (!response.ok) {
        throw new Error(added.error || t('addAthleteError'));
      }

      setAthletes((prev) => [...prev, added]);
      setNewAthlete({
        id: null,
        name: '',
        number: '',
        birthdate: '',
        fpbNumber: null,
        active: true,
      });
      setSuccessMessage(t('addAthleteSuccess'));
    } catch (err) {
      log.error('Error adding athlete:', err);
      setErrorMessage(t('addAthleteError'));
    }
  };

  const handleSaveAthlete = async (athlete: AthleteInterface): Promise<void> => {
    const updated = athlete;
    try {
      const response = await fetch(`/api/athletes/${athlete.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        throw new Error((await response.json())?.error || t('saveError'));
      }

      setAthletes((prev) => prev.map((a) => (a.id === athlete.id ? { ...a, ...updated } : a)));
      setSuccessMessage(t('saveSuccess'));
    } catch (err) {
      log.error('Error saving athlete:', err);
      setErrorMessage(t('saveError'));
    }
  };

  const handleDeleteAthlete = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/athletes/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error((await response.json())?.error || t('deleteError'));
      }
      setAthletes((prev) => prev.filter((a) => a.id !== id));
      setSuccessMessage(t('deleteSuccess'));
    } catch (err) {
      log.error('Error deleting athlete:', err);
      setErrorMessage(t('deleteError'));
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        {t('athletesManagement')}
      </Typography>
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : <></>}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : <></>}

      <AthleteAddComponent
        newAthlete={newAthlete}
        setNewAthlete={setNewAthlete}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        onAddAthlete={handleAddAthlete}
      />

      <AthleteListComponent
        athletes={athletes}
        onDelete={handleDeleteAthlete}
        onEdit={handleSaveAthlete}
      />
    </Box>
  );
};

export default AthletesPage;
