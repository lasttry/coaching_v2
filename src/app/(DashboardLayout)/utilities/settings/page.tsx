'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";
import { CompactPicker } from 'react-color';
import { ColorResult } from 'react-color';
import Grid from '@mui/material/Grid2';
import {
  Box,
  Typography,
  Button,
  Stack,
  CardContent,
} from "@mui/material";
import Image from 'next/image';  // Import Image component from next/image

// Define interface for Settings data
interface SettingsData {
  teamName: string;
  shortName?: string;
  season?: string;
  homeLocation?: string;
  image?: string; // Base64 string to store the image
  backgroundColor?: string; // New field for background color
  foregroundColor?: string; // New field for foreground color
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsData>({
    teamName: '',
    shortName: '',
    season: '',
    homeLocation: '',
    image: undefined,
    backgroundColor: '#ffffff', // Default background color
    foregroundColor: '#000000', // Default foreground color
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const defaultColorResult: ColorResult = {
    hex: '#ffffff',
    hsl: { h: 0, s: 0, l: 1, a: 1 },
    rgb: { r: 255, g: 255, b: 255, a: 1 }
  };
  
  const handleColorChange = (color: ColorResult = defaultColorResult, field: keyof SettingsData) => {
    setSettings((prevState) => ({
      ...prevState,
      [field]: color.hex,
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
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setSuccess(false);
        setErrorMessage(errorData.error || 'Unknown error occurred');
      }
    } catch (error) {
      setSuccess(false);
      setErrorMessage((error as Error).message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <PageContainer title="Settings" description="Manage your settings">
      <DashboardCard title="Team Settings">
        <>
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
                />
              </Box>

              {/* Display the uploaded image */}
              {settings.image && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="imagePreview">
                    Image Preview
                  </Typography>
                  <Image src={settings.image} alt="Uploaded Image" width={200} height={200} />
                </Box>
              )}

              <Box>
                <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="image">
                  Upload Image
                </Typography>
                <input type="file" id="image" onChange={handleImageChange} />
              </Box>

              {/* Background and Foreground color pickers side by side */}
              <Grid container spacing={2}>
                {/* Background color picker */}
                <Grid size={{ xs:6 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="backgroundColor" sx={{ display: 'block', marginBottom: 1 }}>
                      Background Color
                    </Typography>
                    <CompactPicker
                      color={settings.backgroundColor || '#ffffff'}
                      onChangeComplete={(color) => handleColorChange(color, 'backgroundColor')}
                    />
                  </Box>
                </Grid>

                {/* Foreground color picker */}
                <Grid size={{ xs:6 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} component="label" htmlFor="foregroundColor" sx={{ display: 'block', marginBottom: 1 }}>
                      Foreground Color
                    </Typography>
                    <CompactPicker
                      color={settings.foregroundColor || '#000000'}
                      onChangeComplete={(color) => handleColorChange(color, 'foregroundColor')}
                    />
                  </Box>
                </Grid>
              </Grid>

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
