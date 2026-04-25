'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  InputAdornment,
  Paper,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { ptPT } from '@mui/x-data-grid/locales';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  SportsBasketball as SportsBasketballIcon,
} from '@mui/icons-material';
import { OpponentInterface } from '@/types/opponent/types';
import { log } from '@/lib/logger';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import { useDeleteOpponent, useOpponents, useSaveOpponent } from '@/hooks/useOpponents';
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

const initialOpponent: OpponentInterface = {
  name: '',
  shortName: '',
  fpbClubId: undefined,
  fpbTeamId: undefined,
  venues: [],
};

export default function OpponentManagement(): React.JSX.Element {
  const { t } = useTranslation();
  const { data: opponents = [], isLoading: loading, error: fetchError } = useOpponents();
  const saveMutation = useSaveOpponent();
  const deleteMutation = useDeleteOpponent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOpponent, setEditingOpponent] = useState<OpponentInterface | null>(null);
  const [formOpponent, setFormOpponent] = useState<OpponentInterface>(initialOpponent);
  const [newVenue, setNewVenue] = useState('');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const isFormDirty = useFormSnapshotDirty(dialogOpen, { formOpponent, newVenue });

  useEffect(() => {
    if (fetchError) {
      log.error('Error fetching opponents:', fetchError);
      setErrorMessage(fetchError instanceof Error ? fetchError.message : t('opponent.fetch.error'));
    }
  }, [fetchError, t]);

  const handleSave = (): void => {
    if (!formOpponent.name.trim() || !formOpponent.shortName.trim()) {
      return;
    }

    saveMutation.mutate(formOpponent, {
      onSuccess: () => {
        setDialogOpen(false);
        setFormOpponent(initialOpponent);
        setNewVenue('');
        setEditingOpponent(null);
      },
      onError: (err) => {
        log.error('Error saving opponent:', err);
        setErrorMessage(err instanceof Error ? err.message : t('opponent.save.error'));
      },
    });
  };

  const handleEdit = useCallback((opponent: OpponentInterface): void => {
    setEditingOpponent(opponent);
    setFormOpponent(opponent);
    setDialogOpen(true);
  }, []);

  const confirmDelete = useCallback((id?: number): void => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDelete = (): void => {
    if (!deleteId) return;

    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        setDeleteConfirmOpen(false);
        setDeleteId(undefined);
      },
      onError: (err) => {
        log.error('Error deleting opponent:', err);
        setErrorMessage(err instanceof Error ? err.message : t('opponent.delete.error'));
      },
    });
  };

  // Client-side filtering based on search input
  const filteredOpponents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return opponents;
    return opponents.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.shortName.toLowerCase().includes(q) ||
        o.venues?.some((v) => v.name.toLowerCase().includes(q))
    );
  }, [opponents, search]);

  // Define DataGrid columns
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'image',
        headerName: '',
        renderCell: (params) => {
          const row = params.row as OpponentInterface;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <Avatar
                src={row.image}
                variant="rounded"
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: row.image ? 'transparent' : stringToColor(row.name || ''),
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {!row.image && getInitials(row.name || '')}
              </Avatar>
            </Box>
          );
        },
        width: 72,
        sortable: false,
        filterable: false,
      },
      {
        field: 'name',
        headerName: t('common.name'),
        flex: 1.4,
        minWidth: 200,
        renderCell: (params) => {
          const row = params.row as OpponentInterface;
          const hasFpb = Boolean(row.fpbClubId || row.fpbTeamId);
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                height: '100%',
                gap: 0.25,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {row.name}
                </Typography>
                {hasFpb && (
                  <Tooltip title={t('fpb.linked')}>
                    <Chip
                      icon={<SportsBasketballIcon sx={{ fontSize: 14 }} />}
                      label="FPB"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                    />
                  </Tooltip>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {row.shortName}
              </Typography>
            </Box>
          );
        },
      },
      {
        field: 'fpbClubId',
        headerName: t('fpb.clubId'),
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) =>
          params.value ? (
            <Chip size="small" label={String(params.value)} variant="outlined" />
          ) : (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          ),
      },
      {
        field: 'fpbTeamId',
        headerName: t('fpb.teamId'),
        width: 120,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params) =>
          params.value ? (
            <Chip size="small" label={String(params.value)} variant="outlined" />
          ) : (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          ),
      },
      {
        field: 'venues',
        headerName: t('venue.title'),
        flex: 2,
        minWidth: 220,
        renderCell: (params) => {
          const venues = (params.value as { name: string }[] | undefined) ?? [];
          if (venues.length === 0) {
            return (
              <Typography variant="caption" color="text.disabled">
                —
              </Typography>
            );
          }
          return (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                alignItems: 'center',
                height: '100%',
                py: 0.5,
              }}
            >
              {venues.map((v, i) => (
                <Chip
                  key={i}
                  icon={<LocationOnIcon sx={{ fontSize: 14 }} />}
                  label={v.name}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          );
        },
        sortable: false,
      },
      {
        field: 'actions',
        headerName: t('common.actions'),
        width: 110,
        align: 'right',
        headerAlign: 'right',
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('actions.edit')}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEdit(params.row as OpponentInterface)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('actions.delete')}>
              <IconButton size="small" color="error" onClick={() => confirmDelete(params.row.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        sortable: false,
        filterable: false,
      },
    ],
    [handleEdit, confirmDelete, t]
  );

  return (
    <Box>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={5000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t('opponent.management')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {opponents.length} {t('opponent.title')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingOpponent(null);
            setFormOpponent(initialOpponent);
            setDialogOpen(true);
          }}
        >
          {t('opponent.add')}
        </Button>
      </Box>

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

      {/* DataGrid fills the available viewport height */}
      <Box
        sx={{
          height: 'calc(100vh - 280px)',
          minHeight: 420,
          width: '100%',
        }}
      >
        <DataGrid
          rows={filteredOpponents}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id!}
          autoPageSize
          rowHeight={64}
          disableRowSelectionOnClick
          localeText={ptPT.components.MuiDataGrid.defaultProps.localeText}
          initialState={{
            sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
          }}
          sx={{
            borderRadius: 2,
            backgroundColor: 'background.paper',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'action.hover',
              fontWeight: 700,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
          }}
        />
      </Box>

      {/* Create/Edit Dialog */}
      <GuardedDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        isDirty={isFormDirty}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingOpponent ? t('opponent.edit') : t('opponent.add')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {/* Upload Image */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              {formOpponent.image ? (
                <>
                  <Avatar
                    src={formOpponent.image}
                    alt={formOpponent.name}
                    sx={{ width: 80, height: 80, mb: 1 }}
                    variant="rounded"
                  />
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => setFormOpponent({ ...formOpponent, image: undefined })}
                  >
                    {t('images.remove')}
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {t('images.notSelected')}
                  </Typography>
                  <Button variant="outlined" component="label">
                    {t('images.upload')}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const base64 = reader.result as string;
                          setFormOpponent({ ...formOpponent, image: base64 });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </Button>
                </>
              )}
            </Box>

            {/* Name and Short Name */}
            <TextField
              label={t('common.name')}
              value={formOpponent.name}
              onChange={(e) => setFormOpponent({ ...formOpponent, name: e.target.value })}
              required
            />
            <TextField
              label={t('common.shortName')}
              value={formOpponent.shortName}
              onChange={(e) => setFormOpponent({ ...formOpponent, shortName: e.target.value })}
              required
              slotProps={{ htmlInput: { maxLength: 6 } }}
            />

            <TextField
              label={t('fpb.clubId')}
              type="number"
              value={formOpponent.fpbClubId ?? ''}
              onChange={(e) =>
                setFormOpponent({
                  ...formOpponent,
                  fpbClubId: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <TextField
              label={t('fpb.teamId')}
              type="number"
              value={formOpponent.fpbTeamId ?? ''}
              onChange={(e) =>
                setFormOpponent({
                  ...formOpponent,
                  fpbTeamId: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
              slotProps={{ htmlInput: { min: 0 } }}
            />

            {/* Venues */}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField
                label={t('venue.add')}
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (!newVenue.trim()) return;
                  setFormOpponent({
                    ...formOpponent,
                    venues: [...(formOpponent.venues ?? []), { name: newVenue }],
                  });
                  setNewVenue('');
                }}
              >
                {t('actions.add')}
              </Button>
            </Stack>
            <Box>
              {formOpponent.venues?.map((v, i) => (
                <Chip
                  key={i}
                  label={v.name}
                  onDelete={() =>
                    setFormOpponent({
                      ...formOpponent,
                      venues: (formOpponent.venues ?? []).filter((_, idx) => idx !== i),
                    })
                  }
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={handleSave}>
            {t('actions.save')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>{t('messages.confirmDelete')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('messages.deleteConfirmation')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>{t('actions.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
