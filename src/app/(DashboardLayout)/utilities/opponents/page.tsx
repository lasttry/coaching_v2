'use client';
import React, { useState, useEffect, ReactElement } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Stack, Typography, Box, Modal, TextField, Alert } from '@mui/material';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Image from 'next/image';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';

// Define the Opponent type
interface Opponent {
  id: number;
  name: string;
  shortName: string;
  location: string;
  image?: string | null; // Base64 image string
}

const OpponentsList = (): ReactElement => {
  const { t } = useTranslation();

  const [opponents, setOpponents] = useState<Opponent[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOpponent, setCurrentOpponent] = useState<Opponent | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch opponents when the component mounts
  useEffect(() => {
    async function fetchOpponents(): Promise<void> {
      try {
        const response = await fetch('/api/opponents');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.message || t('opponentsFetchError'));
        }

        const data: Opponent[] = await response.json();
        const sortedOpponents = data.sort((a, b) => a.name.localeCompare(b.name));

        log.debug('Fetched and sorted opponents:', sortedOpponents);
        setOpponents(sortedOpponents);
      } catch (err) {
        log.error('Error fetching opponents:', err);
        setErrorMessage(`${t('opponentsFetchError')} ${err}`);
      }
    }

    fetchOpponents();
  }, [t]);

  // Handle opening the modal for adding or editing
  const handleOpenModal = (opponent: Opponent | null): void => {
    setCurrentOpponent(opponent);
    setImagePreview(opponent?.image || null);
    setIsModalOpen(true);
  };

  // Handle saving an opponent
  const handleSaveOpponent = async (): Promise<void> => {
    try {
      const method = currentOpponent?.id ? 'PUT' : 'POST';
      const url = currentOpponent?.id ? `/api/opponents/${currentOpponent.id}` : '/api/opponents';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentOpponent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.message || t('opponentFailedSave'));
      }

      const savedOpponent = await response.json();

      if (currentOpponent?.id) {
        setOpponents((prev) => prev.map((opp) => (opp.id === savedOpponent.id ? savedOpponent : opp)));
        setSuccessMessage(t('opponentSuccessUpdate'));
      } else {
        setOpponents((prev) => [...prev, savedOpponent]);
        setSuccessMessage(t('opponentSuccessAdded'));
      }

      setErrorMessage(null);
      setIsModalOpen(false);
      setCurrentOpponent(null);
      setImagePreview(null);

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      log.error('Error saving opponent:', err);
      setErrorMessage(`${t('opponentFailedSave')} ${err}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Handle deleting an opponent
  const handleDelete = async (id: number, name: string): Promise<void> => {
    const confirmDelete = window.confirm(t('opponentDeleteConfirmation', name));

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/opponents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOpponents((prev) => prev.filter((opponent) => opponent.id !== id));
        setSuccessMessage(t('opponentDeleteSuccess', name));
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData?.message || 'Failed to delete opponent.');
      }
    } catch (err) {
      log.error('Error deleting opponent:', err);
      setErrorMessage(`${t('opponentFailedDelete')} ${err}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Handle image change and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setImagePreview(base64Image);
        setCurrentOpponent((prev) => ({
          ...prev!,
          image: base64Image,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <PageContainer title="Opponents" description="List of all Opponents">
      <h1>{t('opponents')}</h1>
      <Button variant="contained" color="primary" onClick={() => handleOpenModal(null)}>
        {t('opponentAdd')}
      </Button>

      {successMessage ? <Alert severity="success">{successMessage}</Alert> : <></>}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : <></>}

      <DashboardCard title={t('opponents')}>
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <Table sx={{ whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('image')}</TableCell>
                <TableCell>{t('id')}</TableCell>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('shortName')}</TableCell>
                <TableCell>{t('location')}</TableCell>
                <TableCell align="right">{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {opponents.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>
                    {team.image ? (
                      <Image src={team.image} alt={team.name} width={32} height={32} style={{ borderRadius: '50%' }} />
                    ) : (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: '#ccc',
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{team.id}</TableCell>
                  <TableCell>{team.name}</TableCell>
                  <TableCell>{team.shortName}</TableCell>
                  <TableCell>{team.location}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" color="primary" onClick={() => handleOpenModal(team)}>
                        {t('edit')}
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => handleDelete(team.id, team.name)}>
                        {t('Delete')}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </DashboardCard>

      {/* Modal for Adding/Editing Opponent */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>
            {currentOpponent?.id ? t('opponentEdit') : t('opponentAdd')}
          </Typography>
          {successMessage ? <Alert severity="success">{successMessage}</Alert> : <></>}
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : <></>}
          {imagePreview ? (
            <Box>
              <Image src={imagePreview} alt="Opponent Image" width={64} height={64} style={{ borderRadius: '50%' }} />
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setImagePreview(null);
                  setCurrentOpponent((prev) => ({ ...prev!, image: null }));
                }}
              >
                {t('imageRemove')}
              </Button>
            </Box>
          ) : (
            <Typography>{t('imageNotSelected')}</Typography>
          )}

          <Box>
            <label htmlFor="opponent-image">{t('imageUpload')}</label>
            <input type="file" id="opponent-image" accept="image/*" onChange={handleImageChange} />
          </Box>

          <TextField
            fullWidth
            label="Name"
            value={currentOpponent?.name || ''}
            onChange={(e) =>
              setCurrentOpponent((prev) => ({
                ...prev!,
                name: e.target.value,
              }))
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Short Name"
            value={currentOpponent?.shortName || ''}
            onChange={(e) =>
              setCurrentOpponent((prev) => ({
                ...prev!,
                shortName: e.target.value,
              }))
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={currentOpponent?.location || ''}
            onChange={(e) =>
              setCurrentOpponent((prev) => ({
                ...prev!,
                location: e.target.value,
              }))
            }
            margin="normal"
          />
          <Stack direction="row" spacing={2} mt={2}>
            <Button variant="contained" color="primary" onClick={handleSaveOpponent}>
              {t('Save')}
            </Button>
            <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
              {t('Cancel')}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </PageContainer>
  );
};

export default OpponentsList;
