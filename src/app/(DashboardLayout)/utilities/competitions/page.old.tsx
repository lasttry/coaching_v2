'use client';

import React, { useState, useEffect } from 'react';
import { Box, Alert, CircularProgress, Typography } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useTranslation } from 'react-i18next';
import { log } from '@/lib/logger';
import { useMessage } from '@/hooks/useMessage';

import { CompetitionInterface } from '@/types/competition/types';
import CompetitionAddComponent from './components/CompetitionAdd';
import CompetitionListComponent from './components/CompetitionList';

const CompetitionsPage: React.FC = () => {
  const { t } = useTranslation();

  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(5000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);
  const [loading, setLoading] = useState<boolean>(true);

  const [newCompetition, setNewCompetition] = useState<CompetitionInterface>({
    id: null,
    name: '',
    description: '',
    echelonId: null,
    image: null,
    echelon: null,
  });
  const [editedCompetitions, setEditedCompetitions] = useState<{
    [key: number]: CompetitionInterface;
  }>({});

  const [competitions, setCompetitions] = useState<CompetitionInterface[]>([]);
  const [echelons, setEchelons] = useState([]);

  useEffect(() => {
    const fetchCompetitions = async (): Promise<void> => {
      const competitionResponse = await fetch('/api/competition');
      const data = await competitionResponse.json();
      if (!competitionResponse.ok) {
        setErrorMessage(data.error || 'Error getting competitions.');
        return;
      }
      setCompetitions(data);
    };

    const fetchEchelons = async (): Promise<void> => {
      const echelonResponse = await fetch('/api/echelons');
      const data = await echelonResponse.json();
      if (!echelonResponse.ok) {
        setErrorMessage(data.error || 'Error getting echelons.');
        return;
      }
      setEchelons(data);
    };

    fetchCompetitions();
    fetchEchelons();
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddCompetition = async (): Promise<void> => {
    try {
      const response = await fetch('/api/competition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCompetition),
      });

      if (!response.ok) {
        throw new Error(t('addCompetitionError'));
      }

      const addedCompetition = await response.json();
      setCompetitions((prev) => [...prev, addedCompetition]);
      setNewCompetition({
        id: null,
        name: '',
        description: '',
        echelonId: null,
        echelon: null,
        image: null,
      });
    } catch (err) {
      log.error('Error adding competition:', err);
      setErrorMessage(t('addCompetitionError'));
    }
  };

  const handleSaveCompetition = async (id: number | null): Promise<void> => {
    if (!id) return;

    const updatedData = editedCompetitions[id];

    try {
      const response = await fetch(`/api/competition/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('saveError'));
      }

      setCompetitions((prev) =>
        prev.map((comp) => (comp.id === id ? { ...comp, ...updatedData } : comp))
      );
    } catch (err) {
      log.error('Error saving competition:', err);
      setErrorMessage(t('saveError'));
    } finally {
      setSuccessMessage(t('saveSuccess'));
    }
  };

  const handleDeleteCompetition = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/competition/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
        return;
      }

      setCompetitions((prev) => prev.filter((comp) => comp.id !== id));
      setSuccessMessage(t('deleteSuccess'));
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      log.error('Error deleting competition:', err);
      setErrorMessage(`${t('deleteError')}: ${err}`);
    }
  };

  return (
    <PageContainer title="Games" description="Manage all games">
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('competitions')}
        </Typography>

        {/* Display error message */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        {/* Display loading spinner */}
        {loading && <CircularProgress />}
        {!loading && (
          <>
            <CompetitionAddComponent
              echelons={echelons}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              newCompetition={newCompetition}
              setNewCompetition={setNewCompetition}
              onAddCompetition={handleAddCompetition}
            />

            <CompetitionListComponent
              echelons={echelons}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              competitions={competitions}
              setEditedCompetitions={setEditedCompetitions}
              editedCompetitions={editedCompetitions}
              onSaveCompetition={handleSaveCompetition}
              onDeleteCompetition={handleDeleteCompetition}
            />
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default CompetitionsPage;
