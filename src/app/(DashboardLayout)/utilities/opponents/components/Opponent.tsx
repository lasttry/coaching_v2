'use client';
import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Stack,
  Grid
} from '@mui/material';
import Image from 'next/image';
import { OpponentInterface } from '@/types/games/types';
import { useTranslation } from 'react-i18next';

interface Props {
  opponent: OpponentInterface;
  setOpponent: React.Dispatch<React.SetStateAction<OpponentInterface>>;
}

const OpponentComponent: React.FC<Props> = ({
  opponent,
  setOpponent,
}) => {
  const { t } = useTranslation();
  const [newVenue, setNewVenue] = useState('');
  const [imagePreview, setImagePreview] = useState(opponent?.image ?? null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if(opponent === null) {
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setOpponent({ ...opponent, image: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 12 }}>
        {imagePreview ? (
          <Box>
            <Image src={imagePreview} alt="Preview" width={64} height={64} style={{ borderRadius: '50%' }} />
            <Button
              onClick={() => {
                setImagePreview(null);
                if(opponent !== null) {
                  setOpponent({ ...opponent, image: undefined });
                }
              }}
            >
              {t('imageRemove')}
            </Button>
          </Box>
        ) : (
          <Typography>{t('imageNotSelected')}</Typography>
        )}

        <input type="file" accept="image/*" onChange={handleImageChange} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth label={t('name')}
          value={opponent?.name ?? ''}
          onChange={(e) =>
            setOpponent((prev) => ({ ...prev, name: e.target.value }))
          }
          margin="normal"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth label={t('shortName')}
          value={opponent?.shortName ?? ''}
          onChange={(e) =>
            setOpponent((prev) => ({ ...prev, shortName: e.target.value }))
          }
          margin="normal"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12 }}>
        <Typography variant="subtitle1">{t('venues')}</Typography>
        <Stack direction="row" spacing={1} mt={1}>
          <TextField
            fullWidth label={t('newVenue')} value={newVenue}
            onChange={(e) => setNewVenue(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!newVenue.trim() || !opponent) return;

              setOpponent({
                ...opponent,
                venues: [...(opponent.venues || []), { name: newVenue.trim() }],
              });
              setNewVenue('');
            }}
          >
            {t('add')}
          </Button>
        </Stack>

        
        {opponent && Array.isArray(opponent.venues) && opponent.venues.length > 0 && (
          <ul>
            {opponent.venues.map((v, i) => (
              <li key={i}>
                {v.name}
                <Button
                  size="small"
                  onClick={() =>
                    setOpponent({
                      ...opponent,
                      venues: opponent.venues!.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  {t('remove')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Grid>
    </Grid>
  );
};

OpponentComponent.displayName = "OpponentComponent";
export default OpponentComponent;