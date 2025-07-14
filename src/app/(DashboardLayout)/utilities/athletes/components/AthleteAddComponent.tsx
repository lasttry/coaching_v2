'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';
import { AthleteInterface } from '@/types/games/types';
interface AthleteAddProps {
  newAthlete: AthleteInterface;
  setNewAthlete: React.Dispatch<React.SetStateAction<AthleteInterface>>;
  setErrorMessage: (msg: string) => void;
  setSuccessMessage: (msg: string) => void;
  onAddAthlete: () => void;
}

const AthleteAddComponent: React.FC<AthleteAddProps> = ({
  newAthlete,
  setNewAthlete,
  setErrorMessage,
  setSuccessMessage,
  onAddAthlete,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (
    field: keyof AthleteInterface,
    value: string | number | boolean | undefined | null
  ): string => {
    setErrorMessage('');
    setSuccessMessage('');
    switch (field) {
      case 'name':
        if (typeof value !== 'string') return t('NameIsInvalid');
        if (!value) return t('NameIsRequired');
        if (value.length > 50) return t('NameTooLong');
        break;
      case 'number':
        if (!value) return t('NumberIsRequired');
        break;
      case 'birthdate':
        if (!value) return t('BirthdateIsRequired');
        break;
      default:
        break;
    }
    return '';
  };

  const validateAll = (): boolean => {
    const fieldErrors: Record<string, string> = {};
    (['name', 'number', 'birthdate'] as (keyof AthleteInterface)[]).forEach((field) => {
      const err = validate(field, newAthlete[field]);
      if (err) fieldErrors[field] = err;
    });
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleChange =
    (field: keyof AthleteInterface) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = field === 'fpbNumber' ? Number(e.target.value) || null : e.target.value;
      setNewAthlete((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
    };

  const handleSubmit = (): void => {
    if (!validateAll()) return;
    if (onAddAthlete) onAddAthlete();
    setExpanded(false);
  };

  const handleReset = (): void => {
    setNewAthlete({ id: null, name: '', number: '', birthdate: '', fpbNumber: null, active: true });
    setExpanded(false);
    setErrors({});
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{t('addNewAthlete')}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {newAthlete && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 2, sm: 2 }}>
              <TextField
                label={t('number')}
                fullWidth
                value={newAthlete.number}
                onChange={handleChange('number')}
                error={!!errors.number}
                helperText={errors.number}
              />
            </Grid>
            <Grid size={{ xs: 3, sm: 3 }}>
              <TextField
                label={t('name')}
                fullWidth
                value={newAthlete.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid size={{ xs: 2, sm: 2 }}>
              <TextField
                label={t('birthdate')}
                type="date"
                fullWidth
                value={newAthlete.birthdate}
                onChange={handleChange('birthdate')}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.birthdate}
                helperText={errors.birthdate}
              />
            </Grid>
            <Grid size={{ xs: 2, sm: 2 }}>
              <TextField
                label={t('fpbNumber')}
                fullWidth
                type="number"
                value={newAthlete.fpbNumber ?? ''}
                onChange={handleChange('fpbNumber')}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" onClick={handleSubmit}>
                {t('add')}
              </Button>
              <Button variant="outlined" onClick={handleReset} sx={{ ml: 2 }}>
                {t('cancel')}
              </Button>
            </Grid>
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default AthleteAddComponent;
