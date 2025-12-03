'use client';

import React, { useState } from 'react';
import { TextField, Button, Grid, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { AthleteInterface, Size } from '@/types/game/types';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

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

  const handleSelectChange =
    (field: keyof AthleteInterface) => (e: SelectChangeEvent<string | number>) => {
      const value = e.target.value;
      setNewAthlete((prev) => ({ ...prev, [field]: value }));
    };

  const handleSave = (): void => {
    if (!validateAll()) return;
    if (onAddAthlete) onAddAthlete();
  };

  const handleReset = (): void => {
    setNewAthlete({
      id: null,
      name: '',
      number: '',
      birthdate: '',
      fpbNumber: null,
      active: true,
      shirtSize: Size.S,
    });
    setErrors({});
  };

  return (
    <>
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
          <Grid size={{ xs: 2, sm: 2 }}>
            <Select
              value={newAthlete.shirtSize ?? ''}
              onChange={handleSelectChange('shirtSize')}
              fullWidth
              displayEmpty
            >
              <MenuItem value="">{t('selectSize')}</MenuItem>
              {['S', 'M', 'L', 'XL', 'XXL'].map((shirtSize) => (
                <MenuItem key={shirtSize} value={shirtSize}>
                  {shirtSize}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={{ xs: 6, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" onClick={handleSave}>
              {t('add')}
            </Button>
            <Button variant="outlined" onClick={handleReset} sx={{ ml: 2 }}>
              {t('cancel')}
            </Button>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default AthleteAddComponent;
