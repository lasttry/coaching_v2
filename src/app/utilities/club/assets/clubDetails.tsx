import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  UploadFile as UploadIcon,
  DeleteOutlined as DeleteIcon,
  Place as PlaceIcon,
  AddCircleOutlined as AddCircleIcon,
  Business as BusinessIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ClubInterface } from '@/types/club/types';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

interface ClubDetailsProps {
  selectedClub: ClubInterface;
  onEditChange: (field: keyof ClubInterface, value: ClubInterface[keyof ClubInterface]) => void;
  expanded: string | false;
  onExpandedChange: (section: string | false) => void;
}

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
}> = ({ icon, title, badge }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 2 }}>
    <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>{icon}</Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
      {title}
    </Typography>
    {badge && <Box sx={{ ml: 'auto' }}>{badge}</Box>}
  </Box>
);

const ClubDetails: React.FC<ClubDetailsProps> = ({
  selectedClub,
  onEditChange,
  expanded,
  onExpandedChange,
}) => {
  const { t } = useTranslation();
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

  const handleRemoveImage = (): void => {
    onEditChange('image', '');
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

  const handleAddVenue = (): void => {
    if (!newVenue.trim()) return;
    const updatedVenues = [...(selectedClub.venues || []), { name: newVenue.trim() }];
    onEditChange('venues', updatedVenues);
    setNewVenue('');
  };

  const handleRemoveVenue = (index: number): void => {
    const updatedVenues = [...(selectedClub.venues || [])];
    updatedVenues.splice(index, 1);
    onEditChange('venues', updatedVenues);
  };

  const handleChange =
    (section: string) =>
    (_event: React.SyntheticEvent, isExpanded: boolean): void => {
      onExpandedChange(isExpanded ? section : false);
    };

  const bg = selectedClub.backgroundColor || '#ffffff';
  const fg = selectedClub.foregroundColor || '#000000';
  const venuesCount = (selectedClub.venues || []).length;
  const hasImage = !!selectedClub.image;
  const hasFedLogo = !!selectedClub.federationLogo;

  return (
    <Box sx={{ mt: 2 }}>
      {/* Identificação */}
      <Accordion
        expanded={expanded === 'identity'}
        onChange={handleChange('identity')}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SectionHeader
            icon={<BusinessIcon />}
            title={t('club.singular')}
            badge={
              selectedClub.fpbClubId ? (
                <Chip
                  size="small"
                  label={`FPB · ${selectedClub.fpbClubId}`}
                  color="primary"
                  variant="outlined"
                />
              ) : undefined
            }
          />
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('common.name')}
                value={selectedClub.name}
                onChange={(e) => onEditChange('name', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('common.shortName')}
                value={selectedClub.shortName || ''}
                onChange={(e) => onEditChange('shortName', e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t('club.fpbClubId')}
                helperText={t('club.fpbClubIdHelper')}
                value={selectedClub.fpbClubId ?? ''}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  onEditChange('fpbClubId', v === '' ? null : Number(v));
                }}
                slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
                fullWidth
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Imagens */}
      <Accordion expanded={expanded === 'images'} onChange={handleChange('images')} sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SectionHeader
            icon={<ImageIcon />}
            title={t('common.images')}
            badge={
              <Stack direction="row" spacing={0.5}>
                <Chip
                  size="small"
                  label={t('club.image')}
                  color={hasImage ? 'primary' : 'default'}
                  variant={hasImage ? 'filled' : 'outlined'}
                />
                <Chip
                  size="small"
                  label="FPB"
                  color={hasFedLogo ? 'primary' : 'default'}
                  variant={hasFedLogo ? 'filled' : 'outlined'}
                />
              </Stack>
            }
          />
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('club.image')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedClub.image || undefined}
                  variant="rounded"
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: bg,
                    color: fg,
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {!selectedClub.image &&
                    (selectedClub.shortName || selectedClub.name || '?').slice(0, 2).toUpperCase()}
                </Avatar>
                <Stack spacing={1}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<UploadIcon />}
                  >
                    {t('images.upload')}
                    <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                  </Button>
                  {hasImage && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveImage}
                    >
                      {t('images.remove')}
                    </Button>
                  )}
                </Stack>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('club.federationLogo')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {t('club.federationLogoHelper')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedClub.federationLogo || undefined}
                  variant="rounded"
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: 'grey.100',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {!selectedClub.federationLogo && 'FPB'}
                </Avatar>
                <Stack spacing={1}>
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<UploadIcon />}
                  >
                    {t('images.upload')}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFederationLogoUpload}
                    />
                  </Button>
                  {hasFedLogo && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleRemoveFederationLogo}
                    >
                      {t('images.remove')}
                    </Button>
                  )}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Pavilhões */}
      <Accordion expanded={expanded === 'venues'} onChange={handleChange('venues')} sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SectionHeader
            icon={<PlaceIcon />}
            title={t('venue.title')}
            badge={<Chip size="small" label={venuesCount} variant="outlined" />}
          />
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'stretch', mb: 2 }}>
            <TextField
              label={t('venue.new')}
              value={newVenue}
              onChange={(e) => setNewVenue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddVenue();
                }
              }}
              size="small"
              fullWidth
            />
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleAddVenue}
              disabled={!newVenue.trim()}
            >
              {t('actions.add')}
            </Button>
          </Stack>

          {venuesCount === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('venue.none')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(selectedClub.venues || []).map((venue, index) => (
                <Chip
                  key={index}
                  icon={<PlaceIcon sx={{ fontSize: 18 }} />}
                  label={venue.name}
                  onDelete={() => handleRemoveVenue(index)}
                  deleteIcon={<DeleteIcon />}
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    height: 36,
                    px: 0.5,
                    backgroundColor: 'primary.50',
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: 'primary.light',
                    '& .MuiChip-icon': {
                      color: 'primary.main',
                    },
                    '& .MuiChip-deleteIcon': {
                      color: 'error.main',
                      opacity: 0.7,
                      '&:hover': {
                        opacity: 1,
                        color: 'error.main',
                      },
                    },
                  }}
                />
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ClubDetails;
