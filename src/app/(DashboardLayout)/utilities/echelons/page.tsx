'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';
import { EchelonInterface } from '@/types/echelons/types';
import EchelonAddComponent from './components/EchelonAdd';
import EchelonListComponent from './components/EchelonList';
import { useMessage } from '@/hooks/useMessage';

const EchelonsPage: React.FC = () => {
  const { t } = useTranslation();
  const [echelons, setEchelons] = useState<Record<string, EchelonInterface[]>>({});
  const [newEchelon, setNewEchelon] = useState<EchelonInterface>({
    id: null,
    minAge: null,
    maxAge: null,
    name: '',
    description: '',
    gender: null,
  });
  const [editedEchelons, setEditedEchelons] = useState<{
    [key: number]: EchelonInterface;
  }>({});

  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(5000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);

  const fetchEchelons = useCallback(async (): Promise<void> => {
    const response = await fetch('/api/echelons');
    const data = await response.json();
    if (!response.ok) {
      setErrorMessage(data.error || 'Error getting competitions.');
      return;
    }
    setEchelons(groupedAndSortedEchelons(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupedAndSortedEchelons = (
    echelons: EchelonInterface[]
  ): Record<string, EchelonInterface[]> => {
    const grouped = echelons.reduce((acc: Record<string, EchelonInterface[]>, echelon) => {
      const genderKey = echelon.gender || 'Unknown';
      if (!acc[genderKey]) acc[genderKey] = [];
      acc[genderKey].push(echelon);
      return acc;
    }, {});

    Object.keys(grouped).forEach((gender) => {
      grouped[gender].sort((a, b) => (a.minAge ?? 0) - (b.minAge ?? 0));
    });

    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, gender) => ({ ...acc, [gender]: grouped[gender] }), {});
  };

  useEffect(() => {
    fetchEchelons();
  }, [fetchEchelons]);

  const handleAddEchelon = async (): Promise<void> => {
    try {
      const response = await fetch('/api/echelons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEchelon),
      });

      const addedEchelon = await response.json();
      if (!response.ok) {
        throw new Error(addedEchelon.error || t('addEchelonError'));
      }

      // Determine the correct category (e.g., by gender or another grouping criteria)
      const categoryKey = addedEchelon.gender || 'Unknown';

      setEchelons((prev) => ({
        ...prev,
        [categoryKey]: [...(prev[categoryKey] || []), addedEchelon],
      }));
      setNewEchelon({
        id: null,
        name: '',
        description: '',
        minAge: null,
        maxAge: null,
        gender: null,
      });
    } catch (err) {
      log.error('Error adding competition:', err);
      setErrorMessage(t('addCompetitionError'));
    }
  };
  const handleSaveEchelon = async (id: number | null): Promise<void> => {
    if (!id) return;

    const updatedData = editedEchelons[id];

    try {
      const response = await fetch(`/api/echelons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('saveError'));
      }

      setEchelons((prev) => {
        // Ensure prev is defined
        if (!prev) return prev;
        // Iterate over each gender category and update the echelon with the given ID
        const updatedEchelons = Object.keys(prev).reduce(
          (acc, gender) => {
            acc[gender] = prev[gender].map((echelon) =>
              echelon.id === id ? { ...echelon, ...updatedData } : echelon
            );
            return acc;
          },
          {} as Record<string, EchelonInterface[]>
        );
        return updatedEchelons;
      });
    } catch (err) {
      log.error('Error saving echelons:', err);
      setErrorMessage(t('saveError'));
    } finally {
      setSuccessMessage(t('saveSuccess'));
    }
  };

  const handleDeleteEchelon = async (id: number | null): Promise<void> => {
    if (!id) return;
  };
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        {t('echelonsManagement')}
      </Typography>
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      <EchelonAddComponent
        newEchelon={newEchelon}
        setNewEchelon={setNewEchelon}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        onAddEchelon={handleAddEchelon}
      />
      <EchelonListComponent
        echelons={echelons}
        editedEchelons={editedEchelons}
        setEditedEchelons={setEditedEchelons}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
        onSaveEchelon={handleSaveEchelon}
        onDeleteEchelon={handleDeleteEchelon}
      />
    </Box>
  );
};

export default EchelonsPage;
