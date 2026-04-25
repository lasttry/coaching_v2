'use client';

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

import PageContainer from '@/app/components/container/PageContainer';
import {
  useDeleteDrill,
  useDrillTopics,
  useDrills,
  useSaveDrill,
  type DrillListFilters,
} from '@/hooks/useDrills';
import { useEchelons } from '@/hooks/useEchelons';
import { topicLabel } from '@/lib/drillTopics';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

export default function DrillsListPage(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();

  const [filters, setFilters] = useState<DrillListFilters>({});
  const [searchInput, setSearchInput] = useState('');

  React.useEffect(() => {
    const h = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput.trim() || undefined }));
    }, 300);
    return () => clearTimeout(h);
  }, [searchInput]);

  const drills = useDrills(filters);
  const topics = useDrillTopics();
  const echelons = useEchelons();

  const saveDrill = useSaveDrill();
  const deleteDrill = useDeleteDrill();

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const isCreateDirty = useFormSnapshotDirty(createOpen, { newTitle });

  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  const hasFilters = useMemo(
    () =>
      !!(
        filters.search ||
        filters.topicId ||
        filters.echelonId ||
        filters.type ||
        filters.position
      ),
    [filters]
  );

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const drill = await saveDrill.mutateAsync({ title: newTitle.trim() });
      setCreateOpen(false);
      setNewTitle('');
      router.push(`/utilities/drills/${drill.id}`);
    } catch (e) {
      setSnack({
        msg: (e as Error)?.message || t('drill.save.error'),
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDrill.mutateAsync(deleteTarget.id);
      setSnack({ msg: t('drill.save.deleteSuccess'), severity: 'success' });
      setDeleteTarget(null);
    } catch (e) {
      setSnack({
        msg: (e as Error)?.message || t('drill.save.deleteError'),
        severity: 'error',
      });
    }
  };

  const renderTypeChips = (d: {
    typeFundamental: boolean;
    typeIndividual: boolean;
    typeTeam: boolean;
  }) => (
    <Stack direction="row" spacing={0.5}>
      {d.typeFundamental && (
        <Chip size="small" label={t('drill.type.fundamental')} color="primary" variant="outlined" />
      )}
      {d.typeIndividual && (
        <Chip size="small" label={t('drill.type.individual')} color="info" variant="outlined" />
      )}
      {d.typeTeam && (
        <Chip size="small" label={t('drill.type.team')} color="success" variant="outlined" />
      )}
    </Stack>
  );

  const renderPositionChips = (d: {
    posGuard: boolean;
    posForward: boolean;
    posCenter: boolean;
  }) => (
    <Stack direction="row" spacing={0.5}>
      {d.posGuard && <Chip size="small" label="G" />}
      {d.posForward && <Chip size="small" label="F" />}
      {d.posCenter && <Chip size="small" label="C" />}
    </Stack>
  );

  return (
    <PageContainer title={t('drill.title')} description={t('drill.description')}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between', mb: 2 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('drill.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('drill.description')}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            {t('drill.new')}
          </Button>
        </Stack>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('drill.filters.search')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              slotProps={{
                input: { startAdornment: <SearchIcon sx={{ color: 'text.disabled', mr: 1 }} /> },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>{t('drill.filters.topic')}</InputLabel>
              <Select
                label={t('drill.filters.topic')}
                value={filters.topicId ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    topicId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              >
                <MenuItem value="">{t('drill.filters.allTopics')}</MenuItem>
                {(topics.data ?? []).map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topicLabel(t, topic)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('drill.filters.echelon')}</InputLabel>
              <Select
                label={t('drill.filters.echelon')}
                value={filters.echelonId ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    echelonId: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              >
                <MenuItem value="">{t('drill.filters.allEchelons')}</MenuItem>
                {(echelons.data ?? [])
                  .filter(
                    (e): e is typeof e & { id: number } => (e as { id: number | null }).id != null
                  )
                  .map((e) => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('drill.filters.type')}</InputLabel>
              <Select
                label={t('drill.filters.type')}
                value={filters.type ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    type: (e.target.value || null) as DrillListFilters['type'],
                  }))
                }
              >
                <MenuItem value="">{t('drill.filters.allTypes')}</MenuItem>
                <MenuItem value="FUNDAMENTAL">{t('drill.type.fundamental')}</MenuItem>
                <MenuItem value="INDIVIDUAL">{t('drill.type.individual')}</MenuItem>
                <MenuItem value="TEAM">{t('drill.type.team')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>{t('drill.filters.position')}</InputLabel>
              <Select
                label={t('drill.filters.position')}
                value={filters.position ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    position: (e.target.value || null) as DrillListFilters['position'],
                  }))
                }
              >
                <MenuItem value="">{t('drill.filters.allPositions')}</MenuItem>
                <MenuItem value="GUARD">{t('drill.position.guard')}</MenuItem>
                <MenuItem value="FORWARD">{t('drill.position.forward')}</MenuItem>
                <MenuItem value="CENTER">{t('drill.position.center')}</MenuItem>
              </Select>
            </FormControl>
            {hasFilters && (
              <Tooltip title={t('drill.filters.clear')}>
                <IconButton
                  onClick={() => {
                    setFilters({});
                    setSearchInput('');
                  }}
                >
                  <FilterAltOffIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Paper>

        <Card sx={{ overflow: 'hidden' }}>
          {drills.isLoading ? (
            <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : drills.error ? (
            <Alert severity="error" sx={{ m: 2 }}>
              {(drills.error as Error).message}
            </Alert>
          ) : (drills.data ?? []).length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                {hasFilters ? t('drill.list.emptyFiltered') : t('drill.list.empty')}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('drill.list.columns.title')}</TableCell>
                    <TableCell>{t('drill.list.columns.topics')}</TableCell>
                    <TableCell>{t('drill.list.columns.date')}</TableCell>
                    <TableCell>{t('drill.list.columns.author')}</TableCell>
                    <TableCell>{t('drill.list.columns.age')}</TableCell>
                    <TableCell>{t('drill.list.columns.position')}</TableCell>
                    <TableCell>{t('drill.list.columns.type')}</TableCell>
                    <TableCell align="center">{t('drill.list.columns.graphics')}</TableCell>
                    <TableCell align="right">{t('drill.list.columns.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(drills.data ?? []).map((d) => (
                    <TableRow
                      key={d.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/utilities/drills/${d.id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {d.title || d.name || `#${d.id}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {(d.topics ?? []).slice(0, 3).map((topic) => (
                            <Chip key={topic.id} size="small" label={topicLabel(t, topic)} />
                          ))}
                          {(d.topics?.length ?? 0) > 3 && (
                            <Chip size="small" label={`+${(d.topics?.length ?? 0) - 3}`} />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{dayjs(d.updatedAt).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {d.account?.name || d.account?.email || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>{d.echelon?.name || '-'}</TableCell>
                      <TableCell>{renderPositionChips(d)}</TableCell>
                      <TableCell>{renderTypeChips(d)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          icon={<ImageIcon />}
                          label={d._count?.graphics ?? 0}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                          <Tooltip title={t('actions.edit')}>
                            <IconButton
                              size="small"
                              onClick={() => router.push(`/utilities/drills/${d.id}`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('actions.delete')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                setDeleteTarget({
                                  id: d.id,
                                  title: d.title || d.name || `#${d.id}`,
                                })
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>

      <GuardedDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        isDirty={isCreateDirty}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('drill.new')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('drill.fields.title')}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleCreate();
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t('actions.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={!newTitle.trim() || saveDrill.isPending}
          >
            {t('actions.create')}
          </Button>
        </DialogActions>
      </GuardedDialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('drill.delete.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('drill.delete.confirm')} <strong>{deleteTarget?.title}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>{t('actions.cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={deleteDrill.isPending}
          >
            {t('actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {snack ? (
          <Alert severity={snack.severity} onClose={() => setSnack(null)}>
            {snack.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </PageContainer>
  );
}
