'use client';

import React, { useState } from 'react';
import { TextField, Button, Grid, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { Size } from '@prisma/client';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import { AthleteInterface } from '@/types/athlete/types';
import { AthletePreferredNumberInterface } from '@/types/athletePreferredNumber/types';

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
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const validate = (
    field: keyof AthleteInterface,
    value: string | number | boolean | undefined | null | AthletePreferredNumberInterface[]
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

  const handlePreferredNumberChange = (index: number, value: string): void => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;

    setNewAthlete((prev) => {
      const current = prev.preferredNumbers ?? [];
      const updated = current.map((p, i) =>
        i === index
          ? {
              ...p,
              number: numericValue,
            }
          : p
      );
      return { ...prev, preferredNumbers: updated };
    });
  };

  const handleAddPreferredNumber = (): void => {
    setNewAthlete((prev) => {
      const current = prev.preferredNumbers ?? [];
      const nextPreference =
        current.length === 0 ? 1 : Math.max(...current.map((p) => p.preference ?? 0)) + 1;

      const newPreferred: AthletePreferredNumberInterface = {
        id: 0,
        athleteId: prev.id ?? 0,
        number: 0,
        preference: nextPreference,
      };

      return {
        ...prev,
        preferredNumbers: [...current, newPreferred],
      };
    });
  };

  const handleRemovePreferredNumber = (index: number): void => {
    setNewAthlete((prev) => {
      const current = prev.preferredNumbers ?? [];
      const updated = current.filter((_, i) => i !== index);
      return { ...prev, preferredNumbers: updated };
    });
  };

  const handleDragStart = (index: number) => () => {
    setDragIndex(index);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const handleDrop =
    (index: number) =>
    (event: React.DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      if (dragIndex === null || dragIndex === index) return;

      setNewAthlete((prev) => {
        const current = prev.preferredNumbers ?? [];
        if (dragIndex! < 0 || dragIndex! >= current.length) return prev;

        const reordered = [...current];
        const [moved] = reordered.splice(dragIndex!, 1);
        reordered.splice(index, 0, moved);

        const withPreferences = reordered.map((p, i) => ({
          ...p,
          preference: i + 1,
        }));

        return { ...prev, preferredNumbers: withPreferences };
      });

      setDragIndex(null);
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
      preferredNumbers: [],
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
              {Object.values(Size).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Preferred numbers section with drag-and-drop ordering */}
          <Grid size={{ xs: 12, sm: 12 }}>
            <Grid container spacing={1} alignItems="center">
              <Grid size={{ xs: 12 }} sx={{ mb: 1 }}>
                <strong>{t('preferredNumbers')}</strong>
              </Grid>

              {(newAthlete.preferredNumbers ?? []).map((p, index) => (
                <Grid
                  key={`${p.id}-${index}`}
                  container
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 0.5, cursor: 'grab' }}
                  draggable
                  onDragStart={handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop(index)}
                >
                  <Grid size={{ xs: 1, sm: 1 }}>
                    <span>{index + 1}.</span>
                  </Grid>
                  <Grid size={{ xs: 3, sm: 2 }}>
                    <TextField
                      label={t('preferredNumber')}
                      type="number"
                      fullWidth
                      size="small"
                      value={p.number ?? ''}
                      onChange={(e) => handlePreferredNumberChange(index, e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 3, sm: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemovePreferredNumber(index)}
                    >
                      {t('remove')}
                    </Button>
                  </Grid>
                </Grid>
              ))}

              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" onClick={handleAddPreferredNumber}>
                  {t('addPreferredNumber')}
                </Button>
              </Grid>
            </Grid>
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
