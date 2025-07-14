import React, { useState } from 'react';
import {
  Box,
  Button,
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
import { CompactPicker } from 'react-color';
import { ClubInterface } from '@/types/club/types';
import { Grid } from '@mui/material';

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
        <Stack spacing={2}>
          <TextField
            label="Name"
            value={selectedClub.name}
            onChange={(e) => onEditChange('name', e.target.value)}
            fullWidth
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Short Name"
                value={selectedClub.shortName || ''}
                onChange={(e) => onEditChange('shortName', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                label="Season"
                value={selectedClub.season || ''}
                onChange={(e) => onEditChange('season', e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Venues */}
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Venues
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
              <TextField
                label="New Venue"
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={handleAddVenue}>
                Add
              </Button>
            </Stack>
            <Stack spacing={1} mt={2}>
              {(selectedClub.venues || []).map((venue, index) => (
                <Stack
                  direction="row"
                  key={index}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>{venue.name}</Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveVenue(index)}
                  >
                    Remove
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Club Image
            </Typography>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Background Color
                </Typography>
                <CompactPicker
                  color={selectedClub.backgroundColor || '#ffffff'}
                  onChangeComplete={(color) => onEditChange('backgroundColor', color.hex)}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  Foreground Color
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
                Save
              </Button>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Button variant="outlined" onClick={onCancel} sx={{ width: '100%' }}>
                Cancel
              </Button>
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setDeleteOverlayVisible(true)}
                sx={{ width: '100%' }}
              >
                Delete Club
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Box>
      <Dialog open={deleteOverlayVisible} onClose={() => setDeleteOverlayVisible(false)}>
        <DialogTitle>Delete Club</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this club? All information related to this club will be
            deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOverlayVisible(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClubDetails;