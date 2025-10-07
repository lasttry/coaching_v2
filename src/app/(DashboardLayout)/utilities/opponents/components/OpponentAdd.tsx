'use client';
import React, { useState } from 'react';
import { OpponentInterface } from '@/types/games/types';

import OpponentComponent from './Opponent';

import { useTranslation } from 'react-i18next';
import { Accordion, AccordionDetails, AccordionSummary, Box, IconButton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Grid } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';

interface OpponentAddProps {
  opponent: OpponentInterface;
  setOpponent: React.Dispatch<React.SetStateAction<OpponentInterface>>;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  onAddOpponent: () => void;
}

const OpponentAddComponent: React.FC<OpponentAddProps> = ({
  opponent,
  setOpponent,
  onAddOpponent,
  setErrorMessage
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const handleSave = async (): Promise<void> => {
    if (!validate()) return;
    if (onAddOpponent) onAddOpponent();
    setExpanded(false);
  };

  const validate = (): boolean => {
    let error: string | null = null;

    if (!opponent.name?.trim()) {
      error = t('nameRequired', { defaultValue: 'Name is required' });
    } else if (opponent.name.length > 50) {
      error = t('nameTooLong', { defaultValue: 'Name cannot exceed 50 characters' });
    } else if (!opponent.shortName?.trim()) {
      error = t('shortNameRequired', { defaultValue: 'Short name is required' });
    } else if (opponent.shortName.length > 6) {
      error = t('shortNameTooLong', { defaultValue: 'Short name cannot exceed 6 characters' });
    }

    setErrorMessage(error);
    return !error;
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>

        <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }} >
          <Grid size={6}>
            <Typography><span suppressHydrationWarning>{t('addOponent')}</span></Typography>
          </Grid>
          <Grid size={6} sx={{ ml: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
            </Box>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <OpponentComponent
          opponent={opponent}
          setOpponent={setOpponent}
        />
        <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleSave(); }}>
          <AddIcon />
        </IconButton>
      </AccordionDetails>
    </Accordion>
  );
};

OpponentAddComponent.displayName = "OpponentAddComponent";
export default OpponentAddComponent;
