'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useSession } from 'next-auth/react';
import { log } from '@/lib/logger';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import { useTranslation } from 'react-i18next';
import { useMessage } from '@/hooks/useMessage';
import { TeamInterface } from '@/types/teams/types';
import { AthleteInterface } from '@/types/games/types';
import TeamAddComponent from './components/teamAdd';
import TeamsListComponent from './components/teamsList';

const TeamsPage = (): ReactElement => {
  const { data: session } = useSession();

  const { t } = useTranslation();

  const { message: errorMessage, setTimedMessage: setErrorMessage } = useMessage(5000);
  const { message: successMessage, setTimedMessage: setSuccessMessage } = useMessage(5000);
  const [loading, setLoading] = useState<boolean>(true);

  const [newTeam, setNewTeam] = useState<TeamInterface>({
    id: null,
    name: '',
    type: 'OTHER',
    clubId: 0,
    echelonId: -1,
    athletes: [],
    echelon: null,
  });
  const [editedTeam, setEditedTeam] = useState<{
    [key: number]: TeamInterface;
  }>({});
  const [teams, setTeams] = useState<TeamInterface[]>([]);
  const [echelons, setEchelons] = useState([]);
  const [athletes, setAthletes] = useState<AthleteInterface[]>([]);

  useEffect(() => {
    const fetchEchelons = async (): Promise<void> => {
      const echelonResponse = await fetch('/api/echelons');
      const data = await echelonResponse.json();
      if (!echelonResponse.ok) {
        setErrorMessage(data.error || 'Error getting echelons.');
        return;
      }
      setEchelons(data);
    };

    const fetchTeams = async (): Promise<void> => {
      try {
        const response = await fetch('/api/teams');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setTeams(data);
      } catch (error) {
        log.error('Failed to fetch teams:', error);
        setErrorMessage('An error occurred while fetching teams');
        setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10 seconds
      }
    };

    const fetchAthletes = async (): Promise<void> => {
      try {
        const response = await fetch('/api/athletes');
        const dataAthletes = await response.json();
        if (!response.ok) throw new Error(dataAthletes.error);
        setAthletes(dataAthletes);
      } catch (error) {
        log.error('Failed to fetch teams:', error);
        setErrorMessage('An error occurred while fetching teams');
        setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10 seconds
      }
    };

    fetchTeams();
    fetchAthletes();
    fetchEchelons();
    setLoading(false);
  }, []);

  const handleAddTeam = async (): Promise<void> => {
    try {
      if (!session?.user?.selectedClubId) {
        throw new Error('Club ID is missing from the session');
      }
      const teamData = { ...newTeam, clubId: session.user.selectedClubId };

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSuccessMessage('Team created successfully');

      setNewTeam({
        id: null,
        name: '',
        type: 'OTHER',
        clubId: 0,
        echelonId: -1,
        athletes: [],
        echelon: null,
      });
    } catch (error) {
      log.error('Failed to fetch teams:', error);
      setErrorMessage('An error occurred while fetching teams');
      setTimeout(() => setErrorMessage(''), 10000); // Clear error after 10 seconds
    }
  };

  const handleSaveTeam = async (id: number): Promise<void> => {
    if (!id) return;
    const updatedData = editedTeam[id];

    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('saveError'));
      }

      setTeams((prev) => prev.map((comp) => (comp.id === id ? { ...comp, ...updatedData } : comp)));
    } catch (err) {
      log.error('Error saving team:', err);
      setErrorMessage(t('saveError'));
    } finally {
      setSuccessMessage(t('saveSuccess'));
    }
  };

  const handleDeleteTeam = async (id: number): Promise<void> => {
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
        return;
      }

      setTeams((prev) => prev.filter((comp) => comp.id !== id));
      setSuccessMessage(t('deleteSuccess'));
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      log.error('Error deleting competition:', err);
      setErrorMessage(`${t('deleteError')}: ${err}`);
    }
  };

  return (
    <PageContainer title="Teams" description="Manage all teams">
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('teams')}
        </Typography>
        {/* Display error message */}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        {/* Display loading spinner */}
        {loading && <CircularProgress />}
        {!loading && (
          <>
            <TeamAddComponent
              echelons={echelons}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              newTeam={newTeam}
              setNewTeam={setNewTeam}
              onAddTeam={handleAddTeam}
            />

            <TeamsListComponent
              echelons={echelons}
              setErrorMessage={setErrorMessage}
              setSuccessMessage={setSuccessMessage}
              teams={teams}
              athletes={athletes}
              setEditedTeams={setEditedTeam}
              editedTeams={editedTeam}
              onSaveTeam={handleSaveTeam}
              onDeleteTeam={handleDeleteTeam}
            />
          </>
        )}
      </Box>
    </PageContainer>
  );
};

export default TeamsPage;
