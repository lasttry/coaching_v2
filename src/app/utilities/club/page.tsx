'use client';

import React, { useState, useEffect, useMemo, ReactElement } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  SportsBasketball as SportsBasketballIcon,
  LocationOn as LocationOnIcon,
  ArrowBack as ArrowBackIcon,
  DeleteOutlined as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PageContainer from '@/app/components/container/PageContainer';
import DashboardCard from '@/app/components/shared/DashboardCard';
import { ClubInterface } from '@/types/club/types';
import { useSession } from 'next-auth/react';
import ClubDetails from './assets/clubDetails';
import ClubAccounts from './assets/clubAccounts';
import ClubEmailSettings from './assets/clubEmailSettings';
import ClubCourtTheme from './assets/clubCourtTheme';
import ClubAttendanceReasons from './assets/clubAttendanceReasons';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import { useClubs, useCreateClub, useDeleteClub, useUpdateClub } from '@/hooks/useClubs';
import { useMyClubs } from '@/hooks/useMyClubs';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ClubPage = (): ReactElement => {
  const { t } = useTranslation();

  const { data: clubs = [], isLoading: loading, error: clubsError } = useClubs();
  const createClubMutation = useCreateClub();
  const updateClubMutation = useUpdateClub();
  const deleteClubMutation = useDeleteClub();
  const myClubsQuery = useMyClubs();

  const [selectedClub, setSelectedClub] = useState<ClubInterface | null>(null);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const { data: session } = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null | undefined>(null);
  const [expandedSection, setExpandedSection] = useState<string | false>('identity');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (clubsError) setErrorMessage(t('messages.fetchError'));
  }, [clubsError, t]);

  const handleNewClub = (): void => {
    setSelectedClub({
      id: 0,
      name: '',
      shortName: '',
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      image: '',
    });
    setEditing(true);
    setExpandedSection('identity');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCancel = async (): Promise<void> => {
    setSelectedClub(null);
    setEditing(false);
    setExpandedSection('identity');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleEditChange = (
    field: keyof ClubInterface,
    value: ClubInterface[keyof ClubInterface]
  ): void => {
    if (selectedClub) {
      setSelectedClub({ ...selectedClub, [field]: value });
    }
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSelectClub = async (club: ClubInterface): Promise<void> => {
    setSelectedClub(club);
    setEditing(true);
    setExpandedSection('identity');
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleSave = async (): Promise<void> => {
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedClub) return;

    try {
      if (selectedClub.id === 0) {
        const savedClub = await createClubMutation.mutateAsync(selectedClub);
        const addUserResponse = await fetch(`/api/clubs/${savedClub.id}/accounts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: session?.user?.id,
            clubId: savedClub.id,
            roles: [{ role: 'ADMIN' }],
          }),
        });
        if (!addUserResponse.ok) {
          const errorData = await addUserResponse.json();
          setErrorMessage(`${t('club.save.addUserError')}: ${errorData.error}`);
        } else {
          setSuccessMessage(t('club.save.createSuccess'));
        }
        setSelectedClub(savedClub);
      } else {
        const savedClub = await updateClubMutation.mutateAsync({
          id: selectedClub.id!,
          payload: selectedClub,
        });
        setSelectedClub(savedClub);
        setSuccessMessage(t('club.save.updateSuccess'));
      }
      setEditing(false);
    } catch (error) {
      setErrorMessage(`${t('club.save.error')}: ${(error as Error).message}`);
    }
  };

  const handleDeleteClub = (): void => {
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedClub?.id) return;
    deleteClubMutation.mutate(selectedClub.id, {
      onSuccess: () => {
        setSelectedClub(null);
        setEditing(false);
        setSuccessMessage(t('club.save.deleteSuccess'));
      },
      onError: (error) => {
        setErrorMessage(`${t('club.save.deleteError')}: ${(error as Error).message}`);
      },
    });
  };

  const filteredClubs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.shortName ?? '').toLowerCase().includes(q)
    );
  }, [clubs, search]);

  return (
    <PageContainer title={t('club.settings')} description={t('club.settings')}>
      <Box sx={{ p: 3 }}>
        {!editing && (
          <>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h4" gutterBottom>
                  {t('club.settings')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {clubs.length} {t('club.title').toLowerCase()}
                </Typography>
              </Box>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewClub}>
                {t('club.createNew')}
              </Button>
            </Box>

            {/* Search */}
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Paper>

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredClubs.length === 0 ? (
              <Typography color="text.secondary">{t('club.fetch.error')}</Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredClubs.map((club) => {
                  const bg = club.backgroundColor || '#1976d2';
                  const fg = club.foregroundColor || '#ffffff';
                  return (
                    <Grid key={club.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                        }}
                      >
                        <CardActionArea
                          onClick={() => handleSelectClub(club)}
                          sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                          }}
                        >
                          <Box
                            sx={{
                              height: 96,
                              background: bg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            {club.image ? (
                              <Box
                                component="img"
                                src={club.image}
                                alt={club.name}
                                sx={{
                                  maxHeight: '80%',
                                  maxWidth: '80%',
                                  objectFit: 'contain',
                                }}
                              />
                            ) : (
                              <Avatar
                                sx={{
                                  width: 64,
                                  height: 64,
                                  bgcolor: fg,
                                  color: bg,
                                  fontWeight: 700,
                                  fontSize: 24,
                                }}
                              >
                                {getInitials(club.name)}
                              </Avatar>
                            )}
                            {club.fpbClubId && (
                              <Tooltip title={`${t('club.fpbClubId')}: ${club.fpbClubId}`}>
                                <Chip
                                  size="small"
                                  icon={<SportsBasketballIcon sx={{ fontSize: 14 }} />}
                                  label="FPB"
                                  color="primary"
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    fontWeight: 700,
                                  }}
                                />
                              </Tooltip>
                            )}
                          </Box>
                          <CardContent sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 700,
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {club.name}
                            </Typography>
                            {club.shortName && (
                              <Typography variant="caption" color="text.secondary">
                                {club.shortName}
                              </Typography>
                            )}
                            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                                label={`${club.venues?.length ?? 0}`}
                                variant="outlined"
                              />
                            </Box>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </>
        )}

        {/* Edit/create view */}
        {editing && selectedClub && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Button startIcon={<ArrowBackIcon />} onClick={handleCancel}>
                {t('actions.back')}
              </Button>
              <Typography variant="h4">
                {selectedClub.id === 0 ? t('club.create') : t('club.edit')}
              </Typography>
            </Box>

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
                {errorMessage}
              </Alert>
            )}

            <DashboardCard
              title={selectedClub.id === 0 ? t('club.create') : selectedClub.name || t('club.edit')}
            >
              <>
                <ClubDetails
                  selectedClub={selectedClub}
                  onEditChange={handleEditChange}
                  expanded={expandedSection}
                  onExpandedChange={setExpandedSection}
                />
                <ClubAccounts
                  clubId={selectedClub.id}
                  onError={(error: string) => setErrorMessage(error)}
                  expanded={expandedSection === 'accounts'}
                  onExpandedChange={(isExpanded) =>
                    setExpandedSection(isExpanded ? 'accounts' : false)
                  }
                />
                {selectedClub.id && selectedClub.id !== 0 && (
                  <ClubEmailSettings
                    clubId={selectedClub.id}
                    expanded={expandedSection === 'email'}
                    onExpandedChange={(isExpanded) =>
                      setExpandedSection(isExpanded ? 'email' : false)
                    }
                  />
                )}
                <ClubCourtTheme
                  selectedClub={selectedClub}
                  onEditChange={handleEditChange}
                  expanded={expandedSection === 'appearance'}
                  onExpandedChange={(isExpanded) =>
                    setExpandedSection(isExpanded ? 'appearance' : false)
                  }
                />
                {selectedClub.id &&
                selectedClub.id !== 0 &&
                selectedClub.id === Number(session?.user?.selectedClubId) ? (
                  <ClubAttendanceReasons
                    canManage={
                      myClubsQuery.data?.clubs.some(
                        (c) => c.id === selectedClub.id && c.roles.includes('ADMIN')
                      ) ?? false
                    }
                    expanded={expandedSection === 'attendance'}
                    onExpandedChange={(isExpanded) =>
                      setExpandedSection(isExpanded ? 'attendance' : false)
                    }
                  />
                ) : null}

                {/* Action bar - always at the bottom */}
                <Paper
                  variant="outlined"
                  sx={{
                    mt: 3,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                    position: 'sticky',
                    bottom: 16,
                    backgroundColor: 'background.paper',
                    zIndex: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={!selectedClub.id}
                  >
                    {t('club.delete')}
                  </Button>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<CloseIcon />} onClick={handleCancel}>
                      {t('actions.cancel')}
                    </Button>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                      {t('actions.save')}
                    </Button>
                  </Stack>
                </Paper>
              </>
            </DashboardCard>
          </Box>
        )}

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>{t('club.delete')}</DialogTitle>
          <DialogContent>
            <DialogContentText>{t('club.deleteConfirmation')}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>{t('actions.cancel')}</Button>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                handleDeleteClub();
              }}
              color="error"
              variant="contained"
              startIcon={<DeleteIcon />}
            >
              {t('actions.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageContainer>
  );
};

export default ClubPage;
