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
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  setSuccessMessage: React.Dispatch<React.SetStateAction<string | null>>;
  onAddOpponent: (opponent: OpponentInterface) => void;
}

const OpponentAddComponent: React.FC<OpponentAddProps> = ({
  setErrorMessage,
  onAddOpponent
}) => {
  const { t } = useTranslation();
  const [opponent, setOpponent] = useState<OpponentInterface>({ name: '', shortName: '', venues: [] });
  const [expanded, setExpanded] = useState(false);

  const handleSave = async (): Promise<void> => {
    try {
      const response = await fetch('/api/opponents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opponent),
      });
      if (!response.ok) throw new Error(await response.text());
      const newOpponent = await response.json();
      onAddOpponent(newOpponent);
      setOpponent({ name: '', shortName: '', venues: [] });
    } catch (err) {
      setErrorMessage(`${t('opponentFailedSave')} ${err}`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>

        <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }} >
          <Grid size={6}>
            <Typography><span suppressHydrationWarning>{t('addNewAthlete')}</span></Typography>
          </Grid>
          <Grid size={6} sx={{ ml: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
              <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleSave(); }}>
                <AddIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <OpponentComponent
          opponent={opponent}
          setOpponent={setOpponent}
        />
      </AccordionDetails>
    </Accordion>    
  );
};

OpponentAddComponent.displayName = "OpponentAddComponent";
export default OpponentAddComponent;
