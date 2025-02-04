'use client';
import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { log } from '@/lib/logger';
import Grid from '@mui/material/Grid2';
import { EchelonInterface } from '@/types/echelons/types';
import { Gender } from '@prisma/client';
import { useTranslation } from 'react-i18next';

const EchelonsPage = (): ReactElement => {
  const { t } = useTranslation();

  const [echelons, setEchelons] = useState<Record<string, EchelonInterface[]>>({});
  const [form, setForm] = useState<EchelonInterface>({
    id: null,
    minAge: null,
    maxAge: null,
    name: '',
    description: '',
    gender: null,
  });
  const [showCancel, setShowCancel] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getGroupedAndSortedEchelons = (echelons: EchelonInterface[]): Record<string, EchelonInterface[]> => {
    const grouped = echelons.reduce((acc: Record<string, EchelonInterface[]>, echelon) => {
      const genderKey = echelon.gender || 'Unknown'; // Use 'Unknown' for null genders
      if (!acc[genderKey]) {
        acc[genderKey] = [];
      }
      acc[genderKey].push(echelon);
      return acc;
    }, {});

    // Sort each gender group by minAge
    Object.keys(grouped).forEach((gender) => {
      grouped[gender].sort((a, b) => (a.minAge ?? 0) - (b.minAge ?? 0)); // Handle potential null minAge
    });

    // Create a sorted version of the grouped object based on gender keys
    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b)) // Sort gender keys alphabetically
      .reduce((acc: Record<string, EchelonInterface[]>, gender) => {
        acc[gender] = grouped[gender];
        return acc;
      }, {});

    return sortedGrouped;
  };

  const fetchEchelons = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/echelons');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to fetch echelons: ${data.error}`);
      }
      log.info('Echelons fetched successfully:', data);
      const groupedEchelons = getGroupedAndSortedEchelons(data);
      setEchelons(groupedEchelons);
    } catch (error) {
      log.error('Error fetching echelons:', error);
      setErrorMessage(t('failedFetchEchelons'));
    }
  }, [t]); // Add dependencies (only those that can change)

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }> | SelectChangeEvent<string>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name as string]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const method = form.id ? 'PUT' : 'POST';
      const url = form.id ? `/api/echelons/${form.id}` : '/api/echelons';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minAge: form.minAge,
          maxAge: form.maxAge,
          name: form.name,
          description: form.description,
          gender: form.gender,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(`Failed to ${form.id ? 'update' : 'create'} echelon: ${data.error}`);
      }

      log.info(`${form.id ? 'Updated' : 'Created'} echelon successfully:`, data);

      const status = form.id ? t('updated') : t('created');
      setSuccessMessage(t('echelonSuccess', { status }));
      setForm({
        id: null,
        minAge: null,
        maxAge: null,
        name: '',
        description: '',
        gender: null,
      });
      fetchEchelons();
      setShowCancel(false);
    } catch (error) {
      log.error('Error submitting echelon form:', error);
      const status = form.id ? t('update') : t('create');
      setErrorMessage(t('echelonFailed', { status }));
    }
  };

  // Handle delete
  const handleDelete = async (id: number | null | undefined): Promise<void> => {
    try {
      const response = await fetch(`/api/echelons/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete echelon.');
      }

      log.info(`Deleted echelon with ID ${id}`);
      const status = t('deleted');
      setSuccessMessage(t('echelonSuccess', { status }));
      fetchEchelons();
    } catch (error) {
      log.error('Error deleting echelon:', error);
      const status = t('delete');
      setErrorMessage(t('echelonFailed', { status }));
    }
  };

  // Handle edit
  const handleEdit = (echelon: EchelonInterface): void => {
    setForm({
      id: echelon.id,
      minAge: echelon.minAge,
      maxAge: echelon.maxAge,
      name: echelon.name,
      description: echelon.description || '',
      gender: echelon.gender,
    });
    setShowCancel(true);
  };

  const handleCancel = (): void => {
    setForm({
      id: null,
      minAge: null,
      maxAge: null,
      name: '',
      description: '',
      gender: null,
    });
    setShowCancel(false);
  };

  useEffect(() => {
    fetchEchelons();
  }, [fetchEchelons]);

  // Clear messages after a timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 10000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        {t('echelonsManagement')}
      </Typography>

      {/* Success/Error Messages */}
      {successMessage ? <Alert severity="success">{successMessage}</Alert> : <></>}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : <></>}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('minAge')} name="minAge" value={form.minAge ?? ''} onChange={handleChange} type="number" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('maxAge')} name="maxAge" value={form.maxAge ?? ''} onChange={handleChange} type="number" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t('name')} name="name" value={form.name} onChange={handleChange} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth required>
              <InputLabel>{t('gender')}</InputLabel>
              <Select name="gender" value={form.gender ?? ''} onChange={handleChange} label="Gender">
                {Object.entries(Gender).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {t(key)} {/* Display the key (e.g., MALE, FEMALE, COED) */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label={t('description')} name="description" value={form.description} onChange={handleChange} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button type="submit" variant="contained" color="primary">
              {form.id ? t('updateEchelon') : t('createEchelon')}
            </Button>
            <Button
              onClick={() => handleCancel()}
              variant="outlined"
              color="secondary"
              sx={{
                marginLeft: 1,
                display: showCancel ? 'inline-flex' : 'none',
              }}
            >
              {t('cancel')}
            </Button>
          </Grid>
        </Grid>
      </form>

      <TableContainer component={Paper} sx={{ marginTop: 4 }}>
        {Object.entries(echelons).map(([gender, echelons]) => (
          <Accordion key={gender} defaultExpanded>
            {/* Accordion Summary */}
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{t(gender)}</Typography>
            </AccordionSummary>

            {/* Accordion Details */}
            <AccordionDetails>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('name')}</TableCell>
                    <TableCell>{t('minAge')}</TableCell>
                    <TableCell>{t('maxAge')}</TableCell>
                    <TableCell>{t('gender')}</TableCell>
                    <TableCell>{t('description')}</TableCell>
                    <TableCell>{t('actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {echelons.map((echelon) => (
                    <TableRow key={echelon.id}>
                      <TableCell>{echelon.name}</TableCell>
                      <TableCell>{echelon.minAge}</TableCell>
                      <TableCell>{echelon.maxAge}</TableCell>
                      <TableCell>{t(echelon.gender || '')}</TableCell>
                      <TableCell>{echelon.description}</TableCell>
                      <TableCell>
                        <Button onClick={() => handleEdit(echelon)} variant="outlined" color="secondary">
                          {t('edit')}
                        </Button>
                        <Button onClick={() => handleDelete(echelon.id)} variant="outlined" color="error" sx={{ marginLeft: 1 }}>
                          {t('Delete')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        ))}
      </TableContainer>
    </Box>
  );
};

export default EchelonsPage;
