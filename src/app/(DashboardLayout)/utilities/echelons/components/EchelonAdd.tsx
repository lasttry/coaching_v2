'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid2';
import { useTranslation } from 'react-i18next';
import { EchelonInterface } from '@/types/echelons/types';
import { Gender } from '@prisma/client';

interface EchelonAddProps {
  newEchelon: EchelonInterface;
  setNewEchelon: React.Dispatch<React.SetStateAction<EchelonInterface>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;

  onAddEchelon: () => void;
}

const EchelonAddComponent: React.FC<EchelonAddProps> = ({ newEchelon, setNewEchelon, setErrorMessage, setSuccessMessage, onAddEchelon }) => {
  const { t } = useTranslation();
  const [isAccordionExpanded, setAccordionExpanded] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string | number | null | undefined): string => {
    let error = '';

    setErrorMessage('');
    setSuccessMessage('');

    switch (field) {
      case 'name':
        if (typeof value !== 'string' || !value) {
          error = 'Name is required.';
        } else if (value.length > 50) {
          error = 'Name cannot exceed 50 characters.';
        }
        break;

      case 'description':
        if (typeof value === 'string' && value.length > 255) {
          error = 'Description cannot exceed 255 characters.';
        }
        break;

      case 'minAge':
        if (!value || isNaN(Number(value))) {
          error = t('minAgeIsRequired');
        } else if (!Number.isInteger(Number(value)) || Number(value) <= 0) {
          error = t('minAgeMustBePositive');
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateAllFields = (): string[] => {
    const errors: Record<string, string> = {};

    // Use keyof CompetitionInterface to type the field correctly
    (Object.keys(newEchelon) as Array<keyof EchelonInterface>).forEach((field) => {
      const error = validateField(field, newEchelon[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setValidationErrors(errors);

    return Object.values(errors).filter((err) => err !== '');
  };

  // Reset form fields
  const handleReset = (): undefined => {
    setNewEchelon({
      name: '',
      description: '',
      minAge: null,
      maxAge: null,
      gender: null,
    } as EchelonInterface);
    setAccordionExpanded(false);
  };
  // Handle Add Competition
  const handleAddEchelon = (): undefined => {
    if (validateAllFields().length > 0) {
      return;
    }
    if (onAddEchelon) {
      onAddEchelon();
    }
    handleReset();
    setAccordionExpanded(false); // Close the accordion
  };

  const handleSelectChange = (field: string) => (e: SelectChangeEvent<string | null>) => {
    const value = e.target.value; // Valor já está no tipo correto (number | null)
    const error = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
    setNewEchelon((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
    setNewEchelon((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Accordion expanded={isAccordionExpanded} onChange={() => setAccordionExpanded(!isAccordionExpanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{t('addNewEchelon')}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('minAge')}
              value={newEchelon.minAge ?? ''}
              onChange={handleChange('minAge')}
              error={!!validationErrors['minAge']}
              helperText={validationErrors['minAge']}
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('maxAge')}
              value={newEchelon.maxAge ?? ''}
              onChange={handleChange('maxAge')}
              error={!!validationErrors['maxAge']}
              helperText={validationErrors['maxAge']}
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label={t('name')}
              value={newEchelon.name}
              onChange={handleChange('name')}
              error={!!validationErrors['name']}
              helperText={validationErrors['name']}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>{t('gender')}</InputLabel>
              <Select value={newEchelon.gender ?? ''} onChange={handleSelectChange('gender')}>
                {Object.entries(Gender).map(([key, value]) => (
                  <MenuItem key={key} value={value}>
                    {t(key)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('description')}
              value={newEchelon.description}
              onChange={handleChange('description')}
              error={!!validationErrors['description']}
              helperText={validationErrors['description']}
            />
          </Grid>
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={handleAddEchelon}>
              {t('add')}
            </Button>
            <Button variant="outlined" onClick={handleReset} sx={{ marginLeft: 2 }}>
              {t('cancel')}
            </Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

EchelonAddComponent.displayName = 'EchelonAddComponent';
export default EchelonAddComponent;
