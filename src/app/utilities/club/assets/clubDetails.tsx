import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Typography,
  Stack,
  TextField,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import { CompactPicker } from 'react-color';
import { ClubInterface } from '@/types/club/types';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

interface ClubDetailsProps {
  selectedClub: ClubInterface;
  onEditChange: (field: keyof ClubInterface, value: ClubInterface[keyof ClubInterface]) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

const ClubDetails: React.FC<ClubDetailsProps> = ({
  selectedClub,
  onEditChange,
  onSave,
  onCancel,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [deleteOverlayVisible, setDeleteOverlayVisible] = useState(false);
  const [newVenue, setNewVenue] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onEditChange('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFederationLogoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onEditChange('federationLogo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFederationLogo = (): void => {
    onEditChange('federationLogo', '');
  };

  const handleDelete = (): void => {
    setDeleteOverlayVisible(false);
    onDelete();
  };

  const handleAddVenue = (): void => {
    if (!newVenue.trim()) return;
    const updatedVenues = [...(selectedClub.venues || []), { name: newVenue.trim() }];
    onEditChange('venues', updatedVenues); // ✅ no any, no warning
    setNewVenue('');
  };

  const handleRemoveVenue = (index: number): void => {
    const updatedVenues = [...(selectedClub.venues || [])];
    updatedVenues.splice(index, 1);
    onEditChange('venues', updatedVenues); // ✅ no warning
  };

  return (
    <>
      <Box sx={{ marginTop: 4 }}>
        <Divider sx={{ marginY: 2 }} />
        <Stack spacing={3}>
          {/* Federation Logo - at the top */}
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              {t('club.federationLogo')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('club.federationLogoHelper')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={selectedClub.federationLogo || undefined}
                variant="rounded"
                sx={{ width: 120, height: 120, bgcolor: 'grey.200' }}
              >
                {!selectedClub.federationLogo && 'FPB'}
              </Avatar>
              <Stack direction="column" spacing={1}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<IconUpload size={18} />}
                  size="small"
                >
                  {t('images.upload')}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFederationLogoUpload}
                  />
                </Button>
                {selectedClub.federationLogo && (
                  <IconButton
                    color="error"
                    onClick={handleRemoveFederationLogo}
                    size="small"
                    title={t('images.remove')}
                  >
                    <IconTrash size={18} />
                  </IconButton>
                )}
              </Stack>
            </Box>
          </Box>

          <Divider />

          <TextField
            label={t('common.name')}
            value={selectedClub.name}
            onChange={(e) => onEditChange('name', e.target.value)}
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label={t('common.shortName')}
                value={selectedClub.shortName || ''}
                onChange={(e) => onEditChange('shortName', e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Venues */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('venues')}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mt: 1 }}>
              <TextField
                label={t('venue.new')}
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={handleAddVenue}>
                {t('actions.add')}
              </Button>
            </Stack>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {(selectedClub.venues || []).map((venue, index) => (
                <Stack
                  direction="row"
                  key={index}
                  sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography>{venue.name}</Typography>
                  <Button size="small" color="error" onClick={() => handleRemoveVenue(index)}>
                    {t('actions.remove')}
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {t('club.image')}
            </Typography>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('club.backgroundColor')}
                </Typography>
                <CompactPicker
                  color={selectedClub.backgroundColor || '#ffffff'}
                  onChangeComplete={(color) => onEditChange('backgroundColor', color.hex)}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('club.foregroundColor')}
                </Typography>
                <CompactPicker
                  color={selectedClub.foregroundColor || '#000000'}
                  onChangeComplete={(color) => onEditChange('foregroundColor', color.hex)}
                />
              </Box>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <Button variant="contained" color="primary" onClick={onSave} sx={{ width: '100%' }}>
                {t('actions.save')}
              </Button>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Button variant="outlined" onClick={onCancel} sx={{ width: '100%' }}>
                {t('actions.cancel')}
              </Button>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteOverlayVisible(true)}
                sx={{ width: '100%' }}
              >
                {t('club.delete')}
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Box>
      <Dialog open={deleteOverlayVisible} onClose={() => setDeleteOverlayVisible(false)}>
        <DialogTitle>{t('club.delete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('club.deleteConfirmation')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOverlayVisible(false)} color="primary">
            {t('actions.cancel')}
          </Button>
          <Button onClick={handleDelete} color="secondary">
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClubDetails;
