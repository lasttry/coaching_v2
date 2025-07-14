'use client';

import React, { useState } from 'react';
import { Typography, Checkbox } from '@mui/material';
import { Grid } from '@mui/material';
import { AthleteInterface } from '@/types/games/types';

interface AthleteSelectionProps {
  teamId: number;
  athletes: AthleteSelectionInterface[];
  onToggle: (teamId: number, athleteId: number) => void;
}

export interface AthleteSelectionInterface extends AthleteInterface {
  selected: boolean;
}

const AthleteSelectionComponent: React.FC<AthleteSelectionProps> = ({
  teamId,
  athletes = [],
  onToggle,
}) => {
  const [_teamId] = useState(teamId);

  return (
    <>
      {athletes.map((athlete) => (
        <Grid container key={athlete.id} spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Grid size={{ xs: 2 }}>
            <Checkbox checked={athlete.selected} onChange={() => onToggle(_teamId, athlete.id!)} />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography>{athlete.name}</Typography>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Typography>{new Date(athlete.birthdate).getFullYear()}</Typography>
          </Grid>
        </Grid>
      ))}
    </>
  );
};

AthleteSelectionComponent.displayName = 'AthleteSelectionComponent';
export default AthleteSelectionComponent;
