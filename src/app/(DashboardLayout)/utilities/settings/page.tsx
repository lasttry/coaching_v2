'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import {
  Box,
  Typography,
  Button,
  Stack,
  CardContent
} from "@mui/material";

// Define interface for Settings data
interface SettingsData {
  teamName: string;
  shortName?: string;
  season?: string;
  homeLocation?: string;
  image?: string; // Base64 string to store the image
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsData>({
    teamName: '',
    shortName: '',
    season: '',
    homeLocation: '',
    image: undefined,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean | null>(null); // Track success or error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Store the actual error message
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({
    teamName: null,
    shortName: null,
    season: null,
    homeLocation: null,
  });

  useEffect(() => {
    async function fetchSettings() {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data: SettingsData = await response.json();
        setSettings(data);
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleChange = (field: keyof SettingsData, value: string | File) => {
    setSettings(prevState => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prevState => ({
          ...prevState,
          image: reader.result as string, // Set the base64 string of the image
        }));
      };
      reader.readAsDataURL(file); // Read the image as base64 string
    }
  };

  // Client-side validation for season format
  const validateSeason = (season: string): boolean => {
    const regex = /^\d{4}\/\d{4}$/;
    return regex.test(season);
  };

  // Client-side validation logic
  const validate = (): boolean => {
    const newErrors: { [key: string]: string | null } = {};

    // Validate teamName
    if (!settings.teamName || settings.teamName.length > 50) {
      newErrors.teamName = 'Team name is required and must be less than 50 characters.';
    }

    // Validate shortName
    if (settings.shortName && settings.shortName.length > 6) {
      newErrors.shortName = 'Short name must be less than 6 characters.';
    }

    // Validate season
    if (settings.season && !validateSeason(settings.season)) {
      newErrors.season = 'Season format must be YYYY/YYYY.';
    }

    // Validate homeLocation
    if (settings.homeLocation && settings.homeLocation.length > 30) {
      newErrors.homeLocation = 'Home location must be less than 30 characters.';
    }

    setErrors(newErrors);

    // Return true if no errors
    return Object.keys(newErrors).every((key) => !newErrors[key]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!validate()) {
      return;
    }
  
    const data = settings;
  
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      // Scroll to the top of the page after form submission
      window.scrollTo({ top: 0, behavior: 'smooth' });
  
      if (!response.ok) {
        const errorData = await response.json();
        setSuccess(false); // Set error state
        setErrorMessage(errorData.error || 'Unknown error occurred'); // Store the actual error message
        console.error('Error saving settings:', errorData); // Log stack trace to console
  
        // Hide the error message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
          setErrorMessage(null);
        }, 5000);
      } else {
        setSuccess(true); // Set success state
        setErrorMessage(null); // Clear any previous error messages
  
        // Hide the success message after 5 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      }
    } catch (error) {
      setSuccess(false); // Set error state
      setErrorMessage((error as Error).message); // Show actual error message
      console.error('Error saving settings:', error); // Log stack trace to console
  
      // Hide the error message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
        setErrorMessage(null);
      }, 5000);
  
      // Scroll to the top of the page after error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  

  if (loading) return <p>Loading...</p>;

  return (
    <PageContainer title="Settings" description="Manage your settings">
      <DashboardCard title="Team Settings">
        <>
        {/* Display success or error message based on the save operation */}
        {success === true && (
          <BlankCard>
            <CardContent>
              <Typography variant="h5" sx={{ color: (theme) => theme.palette.success.main }}>
                Alterações gravadas
              </Typography>

              <Typography variant="body1" sx={{ color: (theme) => theme.palette.success.main }}>
                As alterações foram gravadas com sucesso.
              </Typography>
            </CardContent>
          </BlankCard>
        )}

        {success === false && (
          <BlankCard>
            <CardContent>
              <Typography variant="h5" sx={{ color: (theme) => theme.palette.error.main }}>
                Erro ao gravar as alterações
              </Typography>

              <Typography variant="body1" sx={{ color: (theme) => theme.palette.error.main }}>
                {errorMessage}
              </Typography>
            </CardContent>
          </BlankCard>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="teamName">
                Team Name
              </Typography>
              <CustomTextField
                id="teamName"
                variant="outlined"
                fullWidth
                value={settings.teamName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('teamName', e.target.value)}
                required
                error={Boolean(errors.teamName)}
                helperText={errors.teamName}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="shortName">
                Short Name
              </Typography>
              <CustomTextField
                id="shortName"
                variant="outlined"
                fullWidth
                value={settings.shortName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('shortName', e.target.value)}
                error={Boolean(errors.shortName)}
                helperText={errors.shortName}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="season">
                Season (YYYY/YYYY)
              </Typography>
              <CustomTextField
                id="season"
                variant="outlined"
                fullWidth
                value={settings.season}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('season', e.target.value)}
                error={Boolean(errors.season)}
                helperText={errors.season}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="homeLocation">
                Home Location
              </Typography>
              <CustomTextField
                id="homeLocation"
                variant="outlined"
                fullWidth
                value={settings.homeLocation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('homeLocation', e.target.value)}
                error={Boolean(errors.homeLocation)}
                helperText={errors.homeLocation}
              />
            </Box>

            {/* Display the uploaded image */}
            {settings.image && (
              <Box>
                <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="imagePreview">
                  Image Preview
                </Typography>
                <img src={settings.image} alt="Uploaded Image" width="200" />
              </Box>
            )}

            <Box>
              <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="image">
                Upload Image
              </Typography>
              <input type="file" id="image" onChange={handleImageChange} />
            </Box>

            <Box>
              <Button
                color="primary"
                variant="contained"
                size="large"
                fullWidth
                type="submit"
              >
                Save Settings
              </Button>
            </Box>
          </Stack>
        </form>
        </>
      </DashboardCard>
    </PageContainer>
  );
};

export default SettingsPage;
