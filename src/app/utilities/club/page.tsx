'use client';

import React, { useState, useEffect, useMemo, ReactElement } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Grid } from '@mui/material';
import { Box, Typography } from '@mui/material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import { ClubInterface } from '@/types/club/types';
import '@/styles/clubsAccordion.css';
import { useSession } from 'next-auth/react';
import ClubDetails from './assets/clubDetails';
import ClubAccounts from './assets/clubAccounts';
import { log } from '@/lib/logger';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

const ClubPage = (): ReactElement => {
  const { t } = useTranslation();

  const [clubs, setClubs] = useState<ClubInterface[]>([]);
  const [selectedClub, setSelectedClub] = useState<ClubInterface | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null | undefined>(null);

  useEffect(() => {
    async function fetchClubs(): Promise<void> {
      try {
        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data: ClubInterface[] = await response.json();
          setClubs(data.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));
        }
      } catch (error) {
        log.error('Failed to fetch clubs:', error);
        setErrorMessage(t('messages.fetchError'));
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  const handleNewClub = (): void => {
    setSelectedClub({
      id: 0,
      name: '',
      shortName: '',
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      image: '',
    });
    setEditing(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCancel = async (): Promise<void> => {
    setSelectedClub(null);
    setEditing(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleEditChange = (
    field: keyof ClubInterface,
    value: ClubInterface[keyof ClubInterface]
  ): void => {
    if (selectedClub) {
      setSelectedClub({ ...selectedClub, [field]: value });
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSelectClub = async (club: ClubInterface): Promise<void> => {
    setSelectedClub(club);
    setEditing(true);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSave = async (): Promise<void> => {
    setSuccessMessage('');
    setErrorMessage('');

    if (selectedClub) {
      try {
        const method = selectedClub.id === 0 ? 'POST' : 'PUT';
        const url = selectedClub.id === 0 ? '/api/clubs' : `/api/clubs/${selectedClub.id}`;
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(selectedClub),
        });
        if (response.ok) {
          const savedClub = await response.json();
          if (selectedClub.id === 0) {
            setClubs((prev) => [...prev, savedClub]);
            const addUserResponse = await fetch(`/api/clubs/${savedClub.id}/accounts`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accountId: session?.user?.id,
                clubId: savedClub.id,
                roles: [{ role: 'ADMIN' }],
              }),
            });
            if (!addUserResponse.ok) {
              const errorData = await addUserResponse.json();
              setErrorMessage(`${t('club.save.addUserError')}: ${errorData.error}`);
            } else {
              setSuccessMessage(t('club.save.createSuccess'));
            }
            setSelectedClub(savedClub);
          } else {
            setClubs((prev) => prev.map((club) => (club.id === savedClub.id ? savedClub : club)));
            setSelectedClub(savedClub);
            setSuccessMessage(t('club.save.updateSuccess'));
          }
          setEditing(false);
        } else {
          setErrorMessage(t('club.save.error'));
        }
      } catch (error) {
        setErrorMessage(`${t('club.save.error')}: ${error}`);
      }
    }
  };

  const handleDeleteClub = async (): Promise<void> => {
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedClub) return;
    try {
      const response = await fetch(`/api/clubs/${selectedClub.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setClubs((prev) => prev.filter((club) => club.id !== selectedClub.id));
        setSelectedClub(null);
        setSuccessMessage(t('club.save.deleteSuccess'));
      } else {
        setErrorMessage(t('club.save.deleteError'));
      }
    } catch (error) {
      setErrorMessage(`${t('club.save.deleteError')}: ${error}`);
    }
  };

  const sortedClubs = useMemo(() => clubs.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)), [clubs]);

  return (
    <PageContainer title={t('club.settings')} description={t('club.settings')}>
      <Box sx={{ padding: 3 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {t('club.title')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid
                container
                spacing={3}
                sx={{ justifyContent: 'flex-start' }}
                className="grid-container"
              >
                {sortedClubs.map((club) => (
                  <Grid
                    key={club.id}
                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <Box
                      className="club-item"
                      style={{
                        background: `${club.backgroundColor || '#ffffff'} url(${club.image || ''}) center/cover`,
                      }}
                      onClick={() => handleSelectClub(club)}
                    >
                      <Box className="club-item-overlay">
                        <Typography variant="body1" className="club-item-overlay-text">
                          {club.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
                <Grid
                  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  <Box className="add-new-item" onClick={handleNewClub}>
                    <Typography variant="h6" className="add-new-item-text">
                      {t('actions.new')}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>
        {/* Success/Error Messages */}
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : <></>}
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : <></>}
        {editing && selectedClub && (
          <DashboardCard title={selectedClub.id === 0 ? t('club.create') : t('club.edit')}>
            <ClubDetails
              selectedClub={selectedClub}
              onSave={handleSave}
              onCancel={handleCancel}
              onDelete={handleDeleteClub}
              onEditChange={handleEditChange}
            />
            <ClubAccounts
              clubId={selectedClub.id}
              onError={(error: string) => setErrorMessage(error)}
            />
          </DashboardCard>
        )}
      </Box>
    </PageContainer>
  );
};

export default ClubPage;
