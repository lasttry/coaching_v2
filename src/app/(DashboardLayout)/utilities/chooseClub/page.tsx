'use client';

import React, { useEffect, useState } from 'react';
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
import Grid from '@mui/material/Grid2';
import PageContainer from '../../components/container/PageContainer';
import '@/styles/clubsAccordion.css';

const ChooseClubPage = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [clubs, setClubs] = useState<
    { id: number; name: string; backgroundColor: string; image: string }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        } else {
          setErrorMessage('Failed to fetch clubs');
        }
      } catch (error) {
        setErrorMessage(`Error fetching clubs: ${error}`);
      }
    };

    fetchClubs();
  }, []);

  const handleSelectClub = async (club: { id: number }) => {
    if (setAsDefault && session?.user?.id) {
      try {
        const response = await fetch(`/api/accounts/${session.user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ selectedClubId: club.id }),
        });
        if (!response.ok) {
          setErrorMessage('Failed to set default club');
          return;
        }
      } catch (error) {
        setErrorMessage(`Error setting default club: ${error}`);
        return;
      }
    }
    try {
      // Optionally refresh the session after updating the token
      const updatedSession = await update({ selectedClubId: club.id }); // Call the `update()` method provided by NextAuth
      console.log('Updated session:', updatedSession);
    } catch (error) {
      setErrorMessage(`Error setting default club: ${error}`);
      return;
    }
    router.push('/')
  };

  return (
    <PageContainer
      title="Clubs Settings"
      description="You can configure your club"
    >
      <Box sx={{ padding: 3 }}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Typography variant="h6" fontWeight="bold">
            Clubs
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning">
              You don&apos;t have a default club, please select the club that
              you want to use.
            </Alert>
          </Box>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={setAsDefault}
                  onChange={(e) => {
                    setSetAsDefault(e.target.checked);
                  }}
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
            <Grid
              container
              spacing={3}
              justifyContent="flex-start"
              className="grid-container"
            >
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
                      <Typography
                        variant="body1"
                        className="club-item-overlay-text"
                      >
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
