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
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EchelonInterface } from '@/types/echelons/types';
import { CompetitionInterface } from '@/types/competition/types';

interface CompetitionAddProps {
  echelons: EchelonInterface[];
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;

  newCompetition: CompetitionInterface;
  setNewCompetition: React.Dispatch<React.SetStateAction<CompetitionInterface>>;

  onAddCompetition: () => void;
}

const CompetitionAddComponent: React.FC<CompetitionAddProps> = ({
  echelons,
  setErrorMessage,
  setSuccessMessage,
  newCompetition,
  setNewCompetition,
  onAddCompetition,
}) => {
  const { t } = useTranslation();
  const [isAccordionExpanded, setAccordionExpanded] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (
    field: string,
    value: string | number | null | EchelonInterface
  ): string => {
    let error = '';

    setErrorMessage('');
    setSuccessMessage('');

    switch (field) {
      case 'name':
        if (typeof value !== 'string' || !value) {
          error = t('NameIsRequired');
        } else if (value.length > 50) {
          error = t('NameCannotExceed50Characters');
        }
        break;

      case 'description':
        if (typeof value === 'string' && value.length > 255) {
          error = t('DescriptionCannotExceed255Characters');
        }
        break;

      case 'image':
        if (
          typeof value === 'string' &&
          !/^https?:\/\/\S+|data:image\/[a-zA-Z]+;base64,\S+/.test(value)
        ) {
          error = t('imageInvalid');
        }
        break;

      case 'echelonId':
        if (typeof value !== 'number' || !value) {
          error = t('echelonRequired');
        } else if (!Number.isInteger(value) || value <= 0) {
          error = t('echelonIdPositive');
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
    (Object.keys(newCompetition) as Array<keyof CompetitionInterface>).forEach((field) => {
      const error = validateField(field, newCompetition[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setValidationErrors(errors);

    return Object.values(errors).filter((err) => err !== '');
  };

  // Reset form fields
  const handleReset = (): undefined => {
    setNewCompetition({
      name: '',
      description: '',
      image: '',
      echelonId: 0,
    } as CompetitionInterface);
    setAccordionExpanded(false);
  };

  // Handle Add Competition
  const handleAddCompetition = (): undefined => {
    // Stop if there are validation errors
    if (validateAllFields().length > 0) {
      return;
    }
    if (onAddCompetition) {
      onAddCompetition();
    }
    handleReset();
    setAccordionExpanded(false); // Close the accordion
  };

  // Handle image upload and conversion to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): undefined => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setNewCompetition((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectChange = (field: string) => (e: SelectChangeEvent<number | null>) => {
    const value = e.target.value; // Valor já está no tipo correto (number | null)
    const error = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
    setNewCompetition((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
    setNewCompetition((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Add New Competition */}
      <Accordion
        expanded={isAccordionExpanded}
        onChange={() => setAccordionExpanded(!isAccordionExpanded)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>{t('addNewCompetition')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <TextField
                label={t('name')}
                value={newCompetition.name}
                onChange={handleChange('name')}
                error={!!validationErrors['name']}
                helperText={validationErrors['name']}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <TextField
                label={t('description')}
                value={newCompetition.description}
                onChange={handleChange('description')}
                error={!!validationErrors['description']}
                helperText={validationErrors['description']}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Select
                value={newCompetition.echelonId ?? ''}
                onChange={handleSelectChange('echelonId')}
                fullWidth
              >
                <MenuItem value="">
                  <em>{t('selectEchelon')}</em>
                </MenuItem>
                {echelons
                  .filter((echelon) => typeof echelon.id === 'number') // Only include items where id is a number
                  .map((echelon) => (
                    <MenuItem key={echelon.id} value={Number(echelon.id)}>
                      {echelon.name}
                    </MenuItem>
                  ))}
              </Select>
              {validationErrors.echelonId ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: (theme) => theme.palette.error.main,
                    marginTop: 1,
                  }}
                >
                  {validationErrors.echelonId}
                </Typography>
              ) : null}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" component="label">
                {t('uploadImage')}
                <input type="file" hidden onChange={handleImageChange} />
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="contained" onClick={handleAddCompetition}>
                {t('add')}
              </Button>
              <Button variant="outlined" onClick={handleReset} sx={{ marginLeft: 2 }}>
                {t('cancel')}
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

CompetitionAddComponent.displayName = 'CompetitionAddComponent';
export default CompetitionAddComponent;
