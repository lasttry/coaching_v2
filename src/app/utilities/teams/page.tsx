'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Avatar,
  Paper,
  InputAdornment,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  SportsBasketball as SportsBasketballIcon,
  EventAvailable as EventAvailableIcon,
  Groups as GroupsIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { ptPT } from '@mui/x-data-grid/locales';

import dayjs from 'dayjs';

import { TeamInterface } from '@/types/teams/types';
import { GameInterface } from '@/types/game/types';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import { AthleteInterface } from '@/types/athlete/types';
import { useTeams, useSaveTeam, useDeleteTeam } from '@/hooks/useTeams';
import { useEchelons } from '@/hooks/useEchelons';
import { useAthletes } from '@/hooks/useAthletes';
import { useCurrentSeason } from '@/hooks/useSeasons';
import { useGames } from '@/hooks/useGames';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 45%)`;
};

export default function TeamsPage(): React.JSX.Element {
  const { t } = useTranslation();

  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useTeams();
  const { data: echelons = [] } = useEchelons();
  const { data: athletes = [] } = useAthletes();
  const { data: games = [] } = useGames();
  const { data: currentSeason = null } = useCurrentSeason();

  const saveTeamMutation = useSaveTeam();
  const deleteTeamMutation = useDeleteTeam();

  const loading = teamsLoading;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState<number | false>(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTeam, setFormTeam] = useState<Partial<TeamInterface>>({
    name: '',
    type: 'OTHER',
    echelonId: 0,
  });
  const [editingTeam, setEditingTeam] = useState<TeamInterface | null>(null);

  const [athletesDialogOpen, setAthletesDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamInterface | null>(null);
  const [selectedAthletes, setSelectedAthletes] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const isTeamFormDirty = useFormSnapshotDirty(dialogOpen, formTeam);
  // Sets are not directly serialisable; convert to array snapshot before
  // diffing so the guard catches roster edits in the athletes dialog.
  const isAthletesDirty = useFormSnapshotDirty(athletesDialogOpen, {
    selection: Array.from(selectedAthletes.ids ?? []).sort(),
  });

  useEffect(() => {
    if (teamsError) {
      setErrorMessage((teamsError as Error).message || t('team.fetch.error'));
    }
  }, [teamsError, t]);

  const handleSave = (): void => {
    if (!formTeam.name || !formTeam.echelonId) return;

    saveTeamMutation.mutate(
      { id: editingTeam?.id, payload: formTeam },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setEditingTeam(null);
          setFormTeam({ name: '', type: 'OTHER', echelonId: 0 });
        },
        onError: (err) => {
          setErrorMessage((err as Error).message || t('team.save.error'));
        },
      }
    );
  };

  const handleEdit = (team: TeamInterface): void => {
    setEditingTeam(team);
    setFormTeam(team);
    setDialogOpen(true);
  };

  const handleDelete = (id: number | null): void => {
    if (id === null) return;
    deleteTeamMutation.mutate(id, {
      onError: (err) => {
        setErrorMessage((err as Error).message || t('team.delete.error'));
      },
    });
  };

  const openAthletesDialog = (team: TeamInterface): void => {
    setSelectedTeam(team);
    const preselected = team.athletes?.map((a) => a.athleteId) ?? [];
    setSelectedAthletes({ type: 'include', ids: new Set(preselected) });
    setAthletesDialogOpen(true);
  };

  const handleSaveAthletes = (): void => {
    if (!selectedTeam?.id) return;
    saveTeamMutation.mutate(
      {
        id: selectedTeam.id,
        payload: {
          athleteIds: Array.from(selectedAthletes.ids).map((id) => Number(id)),
        },
      },
      {
        onSuccess: () => {
          setAthletesDialogOpen(false);
          setSelectedTeam(null);
        },
        onError: (err) => {
          setErrorMessage((err as Error).message || t('team.save.error'));
        },
      }
    );
  };

  const getFederativeAge = (birthdate: string): number => {
    const seasonStartYear = currentSeason?.startDate
      ? dayjs(currentSeason.startDate).year()
      : dayjs().year();
    const birthYear = dayjs(birthdate).year();
    return seasonStartYear - birthYear;
  };

  const getUpcomingGames = (teamId: number | null): GameInterface[] => {
    if (!teamId) return [];
    const now = Date.now();
    return games
      .filter((g) => g.teamId === teamId && g.date && new Date(g.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(q) || (team.echelon?.name ?? '').toLowerCase().includes(q)
    );
  }, [teams, search]);

  const sortedTeams = useMemo(
    () => [...filteredTeams].sort((a, b) => a.name.localeCompare(b.name, 'pt')),
    [filteredTeams]
  );

  const athleteColumns: GridColDef<AthleteInterface>[] = [
    { field: 'name', headerName: t('common.name'), flex: 1 },
    {
      field: 'birthdate',
      headerName: t('common.birthdate'),
      flex: 1,
      valueFormatter: (_value) => dayjs(_value as string).format('YYYY-MM-DD'),
    },
    {
      field: 'age',
      headerName: t('common.age'),
      width: 100,
      valueGetter: (_value, row: AthleteInterface) => getFederativeAge(row.birthdate),
    },
  ];

  return (
    <Box>
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
            {t('team.management')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {teams.length} {t('team.plural').toLowerCase()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingTeam(null);
            setFormTeam({ name: '', type: 'OTHER', echelonId: 0 });
            setDialogOpen(true);
          }}
        >
          {t('team.add')}
        </Button>
      </Box>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

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

      {loading && <Typography color="text.secondary">{t('common.loading')}</Typography>}

      {!loading && sortedTeams.length === 0 && (
        <Typography color="text.secondary">{t('team.fetch.notFound')}</Typography>
      )}

      {/* Teams as expandable cards */}
      {!loading &&
        sortedTeams.map((team) => {
          const upcoming = getUpcomingGames(team.id);
          const athletesInTeam = team.athletes ?? [];
          const typeLabel = team.type === 'OTHER' ? t('common.other') : team.type;

          return (
            <Accordion
              key={team.id}
              expanded={expandedTeamId === team.id}
              onChange={(_, isExpanded) =>
                setExpandedTeamId(isExpanded ? (team.id as number) : false)
              }
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    pr: 2,
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: stringToColor(team.name),
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      {getInitials(team.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {team.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip size="small" label={typeLabel} variant="outlined" />
                        {team.echelon?.name && (
                          <Chip
                            size="small"
                            label={team.echelon.name}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {team.fpbTeamId && (
                          <Tooltip title={`${t('fpb.teamId')}: ${team.fpbTeamId}`}>
                            <Chip
                              size="small"
                              icon={<SportsBasketballIcon sx={{ fontSize: 14 }} />}
                              label="FPB"
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 700 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<GroupsIcon sx={{ fontSize: 16 }} />}
                      label={`${athletesInTeam.length} ${t('athlete.title').toLowerCase()}`}
                      size="small"
                    />
                    <Chip
                      icon={<EventAvailableIcon sx={{ fontSize: 16 }} />}
                      label={`${upcoming.length} ${t('game.upcoming').toLowerCase()}`}
                      size="small"
                      color={upcoming.length > 0 ? 'primary' : 'default'}
                      variant={upcoming.length > 0 ? 'filled' : 'outlined'}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title={t('athlete.manage')}>
                        <IconButton
                          component="span"
                          size="small"
                          color="primary"
                          onClick={() => openAthletesDialog(team)}
                        >
                          <PeopleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('actions.edit')}>
                        <IconButton
                          component="span"
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(team)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('actions.delete')}>
                        <IconButton
                          component="span"
                          size="small"
                          color="error"
                          onClick={() => setDeleteConfirmId(team.id as number)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Grid container spacing={2}>
                  {/* Athletes list */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <GroupsIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {t('athlete.title')}
                        </Typography>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={athletesInTeam.length}
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                      <Divider sx={{ mb: 1 }} />

                      {athletesInTeam.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          {t('athlete.fetch.notFound')}
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            maxHeight: 360,
                            overflowY: 'auto',
                          }}
                        >
                          {[...athletesInTeam]
                            .sort((a, b) =>
                              (a.athlete?.name ?? '').localeCompare(b.athlete?.name ?? '', 'pt')
                            )
                            .map((ta) => {
                              const a = ta.athlete;
                              if (!a) return null;
                              return (
                                <Box
                                  key={ta.athleteId}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    p: 1,
                                    borderRadius: 1,
                                    '&:hover': { backgroundColor: 'action.hover' },
                                  }}
                                >
                                  <Avatar
                                    src={a.photo || undefined}
                                    variant="rounded"
                                    sx={{
                                      width: 36,
                                      height: 42,
                                      bgcolor: a.photo
                                        ? 'transparent'
                                        : stringToColor(a.name || ''),
                                      color: '#fff',
                                      fontWeight: 600,
                                      fontSize: 12,
                                    }}
                                  >
                                    {!a.photo && getInitials(a.name || '')}
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                      }}
                                    >
                                      {a.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {a.birthdate ? dayjs(a.birthdate).format('DD/MM/YYYY') : ''}
                                      {a.birthdate &&
                                        ` · ${getFederativeAge(a.birthdate)} ${t('common.age').toLowerCase()}`}
                                    </Typography>
                                  </Box>
                                  {a.number && (
                                    <Chip
                                      label={a.number}
                                      size="small"
                                      color="primary"
                                      sx={{ fontWeight: 700 }}
                                    />
                                  )}
                                </Box>
                              );
                            })}
                        </Box>
                      )}
                    </Paper>
                  </Grid>

                  {/* Upcoming games */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <EventAvailableIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {t('game.upcoming')}
                        </Typography>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={upcoming.length}
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                      <Divider sx={{ mb: 1 }} />

                      {upcoming.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          {t('game.notFound')}
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            maxHeight: 360,
                            overflowY: 'auto',
                          }}
                        >
                          {upcoming.map((g, idx) => {
                            const isNext = idx === 0;
                            return (
                              <Box
                                key={g.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  p: 1,
                                  borderRadius: 1,
                                  borderLeft: isNext ? '3px solid' : 'none',
                                  borderLeftColor: 'primary.main',
                                  backgroundColor: isNext ? 'action.hover' : 'transparent',
                                  '&:hover': { backgroundColor: 'action.hover' },
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: 48,
                                    p: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: isNext ? 'primary.main' : 'action.selected',
                                    color: isNext ? 'primary.contrastText' : 'text.primary',
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    {dayjs(g.date).format('MMM').toUpperCase()}
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 'bold', lineHeight: 1 }}
                                  >
                                    {dayjs(g.date).format('DD')}
                                  </Typography>
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 600,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {g.away ? '@ ' : ''}
                                    {g.opponent?.name ?? t('common.opponent')}
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <Typography variant="caption" color="text.secondary">
                                      {dayjs(g.date).format('DD/MM HH:mm')}
                                    </Typography>
                                    {g.venue?.name && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}
                                      >
                                        <LocationOnIcon sx={{ fontSize: 12 }} />
                                        {g.venue.name}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                                {isNext && (
                                  <Chip
                                    size="small"
                                    color="primary"
                                    label={t('game.next')}
                                    sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                                  />
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          );
        })}

      {/* Add/Edit Team Dialog */}
      <GuardedDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        isDirty={isTeamFormDirty}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingTeam ? t('team.edit') : t('team.add')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('common.name')}
            value={formTeam.name ?? ''}
            onChange={(e) => setFormTeam({ ...formTeam, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Select
            fullWidth
            value={formTeam.type ?? 'OTHER'}
            onChange={(e) =>
              setFormTeam({ ...formTeam, type: e.target.value as 'A' | 'B' | 'OTHER' })
            }
            sx={{ mt: 2 }}
          >
            <MenuItem value="A">A</MenuItem>
            <MenuItem value="B">B</MenuItem>
            <MenuItem value="C">C</MenuItem>
            <MenuItem value="OTHER">{t('common.other')}</MenuItem>
          </Select>
          <Select
            fullWidth
            value={formTeam.echelonId ?? 0}
            onChange={(e) => setFormTeam({ ...formTeam, echelonId: Number(e.target.value) })}
            sx={{ mt: 2 }}
          >
            {echelons.map((e) => (
              <MenuItem key={Number(e.id)} value={String(e.id)}>
                {e.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label={t('team.fpbTeamId')}
            helperText={t('team.fpbTeamIdHelper')}
            value={formTeam.fpbTeamId ?? ''}
            onChange={(e) => {
              const v = e.target.value.trim();
              setFormTeam({ ...formTeam, fpbTeamId: v === '' ? null : Number(v) });
            }}
            slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      {/* Athletes Manager Dialog */}
      <GuardedDialog
        open={athletesDialogOpen}
        onClose={() => setAthletesDialogOpen(false)}
        isDirty={isAthletesDirty}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {t('athlete.manage')}
          {selectedTeam ? ` ${t('common.for')} ${selectedTeam.name}` : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 400 }}>
            <DataGrid
              rows={(athletes ?? [])
                .map((a) => ({
                  ...a,
                  age: getFederativeAge(a.birthdate),
                }))
                .filter((a) => {
                  const echelon = selectedTeam?.echelon;
                  if (!echelon) return true;
                  const minAge = echelon.minAge ?? 0;
                  const maxAge = echelon.maxAge ?? 100;
                  return a.age >= minAge && a.age <= maxAge;
                })}
              columns={athleteColumns}
              checkboxSelection
              getRowId={(row) => Number(row.id)}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
              rowSelectionModel={selectedAthletes}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedAthletes(newSelection);
              }}
              localeText={ptPT.components.MuiDataGrid.defaultProps.localeText}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAthletesDialogOpen(false)}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveAthletes}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      {/* Delete confirmation */}
      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
        <DialogTitle>{t('messages.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('messages.deleteConfirmation')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmId(null)}>{t('actions.cancel')}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (deleteConfirmId !== null) {
                handleDelete(deleteConfirmId);
                setDeleteConfirmId(null);
              }
            }}
          >
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
