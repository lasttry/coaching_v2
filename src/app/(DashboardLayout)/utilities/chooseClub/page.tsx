'use client';

import React, { useEffect, useState, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Accordion,
  AccordionDetails,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Grid } from '@mui/material';
import PageContainer from '../../components/container/PageContainer';
import { log } from '@/lib/logger';
import '@/styles/clubsAccordion.css';

const ChooseClubPage = (): ReactElement => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [clubs, setClubs] = useState<
    { id: number; name: string; backgroundColor: string; image: string }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);

  useEffect(() => {
    const fetchClubs = async (): Promise<void> => {
      try {
        const response = await fetch('/api/clubs');
        const data = await response.json();
        if (!response.ok) {
          const errorText = `Failed to fetch clubs, status: ${data}`;
          log.error(errorText);
          setErrorMessage(errorText);
          return;
        }
        setClubs(data);
      } catch (error) {
        const errorText = `Error fetching clubs: ${error}`;
        log.error(errorText);
        setErrorMessage(errorText);
      }
    };

    fetchClubs();
  }, []);

  const handleSelectClub = async (club: { id: number }): Promise<void> => {
    if (!session?.user?.id) {
      log.error('Session or user ID is missing.');
      setErrorMessage('Unable to identify the user session. Please log in again.');
      return;
    }

    if (setAsDefault) {
      try {
        const response = await fetch(`/api/accounts/${session.user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ defaultClubId: club.id }),
        });
        if (!response.ok) {
          const errorText = 'Failed to set default club';
          log.error(errorText);
          setErrorMessage(errorText);
          return;
        }
      } catch (error) {
        const errorText = `Error setting default club: ${error}`;
        log.error(errorText);
        setErrorMessage(errorText);
        return;
      }
    }

    try {
      const updatedSession = await update({ selectedClubId: club.id });
    } catch (error) {
      const errorText = `Error updating session: ${error}`;
      log.error(errorText);
      setErrorMessage(errorText);
      return;
    }

    router.push('/');
  };

  return (
    <PageContainer title="Clubs Settings" description="You can configure your club">
      <Box sx={{ padding: 3 }}>
        {errorMessage ? (
          <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
            {errorMessage}
          </Typography>
        ) : (
          <></>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography variant="h6" fontWeight="bold">
            Clubs
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning">
              You don&apos;t have a default club, please select the club that you want to use.
            </Alert>
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={setAsDefault}
                  onChange={(e) => setSetAsDefault(e.target.checked)}
                  name="setAsDefault"
                  color="primary"
                />
              }
              label="Set as default..."
            />
          </Box>
        </Box>
        <Accordion defaultExpanded>
          <AccordionDetails>
            <Grid container spacing={3} justifyContent="flex-start" className="grid-container">
              {clubs.map((club) => (
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
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </PageContainer>
  );
};

export default ChooseClubPage;
