'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import TagIcon from '@mui/icons-material/LocalOffer';
import DeleteIcon from '@mui/icons-material/Delete';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

import PageContainer from '@/app/components/container/PageContainer';
import { useDeleteDrill, useDrill, useDrillTopics, useSaveDrill } from '@/hooks/useDrills';
import { useEchelons } from '@/hooks/useEchelons';
import { useMyClubs } from '@/hooks/useMyClubs';
import { topicLabel } from '@/lib/drillTopics';
import TopicsDialog from './components/TopicsDialog';
import GraphicsPanel from './components/GraphicsPanel';

interface FormState {
  title: string;
  echelonId: number | '';
  description: string;
  goals: string;
  variations: string;
  tips: string;
  defaultText: string;
  ballsCount: number;
  basketsCount: number;
  conesCount: number;
  extraEquipment: string;
  playersCount: number;
  coachesCount: number;
  typeFundamental: boolean;
  typeIndividual: boolean;
  typeTeam: boolean;
  posGuard: boolean;
  posForward: boolean;
  posCenter: boolean;
}

const EMPTY_FORM: FormState = {
  title: '',
  echelonId: '',
  description: '',
  goals: '',
  variations: '',
  tips: '',
  defaultText: '',
  ballsCount: 0,
  basketsCount: 0,
  conesCount: 0,
  extraEquipment: '',
  playersCount: 0,
  coachesCount: 0,
  typeFundamental: false,
  typeIndividual: false,
  typeTeam: false,
  posGuard: false,
  posForward: false,
  posCenter: false,
};

export default function DrillEditPage(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const drillId = Number(params?.id);

  const drillQuery = useDrill(drillId);
  const topicsQuery = useDrillTopics();
  const echelonsQuery = useEchelons();
  const myClubsQuery = useMyClubs();
  /* Only club ADMINs can curate the topic list (add/rename/delete). Other
   * users may still pick topics for their drills — the manage controls
   * just aren't rendered for them. */
  const canManageTopics =
    myClubsQuery.data?.clubs.some((c) => c.isDefault && c.roles.includes('ADMIN')) ?? false;

  const saveDrill = useSaveDrill();
  const deleteDrill = useDeleteDrill();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snack, setSnack] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const d = drillQuery.data;
    if (!d) return;
    setForm({
      title: d.title || d.name || '',
      echelonId: d.echelonId ?? '',
      description: d.description ?? '',
      goals: d.goals ?? '',
      variations: d.variations ?? '',
      tips: d.tips ?? '',
      defaultText: d.defaultText ?? '',
      ballsCount: d.ballsCount ?? 0,
      basketsCount: d.basketsCount ?? 0,
      conesCount: d.conesCount ?? 0,
      extraEquipment: d.extraEquipment ?? '',
      playersCount: d.playersCount ?? 0,
      coachesCount: d.coachesCount ?? 0,
      typeFundamental: !!d.typeFundamental,
      typeIndividual: !!d.typeIndividual,
      typeTeam: !!d.typeTeam,
      posGuard: !!d.posGuard,
      posForward: !!d.posForward,
      posCenter: !!d.posCenter,
    });
    setSelectedTopicIds((d.topics ?? []).map((topic) => topic.id));
  }, [drillQuery.data]);

  const selectedTopics = useMemo(() => {
    const map = new Map((topicsQuery.data ?? []).map((topic) => [topic.id, topic]));
    return selectedTopicIds.map((id) => map.get(id)).filter(Boolean) as NonNullable<
      ReturnType<typeof map.get>
    >[];
  }, [selectedTopicIds, topicsQuery.data]);

  const showMessage = (msg: string, severity: 'success' | 'error' = 'success') =>
    setSnack({ msg, severity });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      showMessage(t('drill.fields.titleRequired'), 'error');
      return;
    }
    try {
      await saveDrill.mutateAsync({
        id: drillId,
        title: form.title.trim(),
        echelonId: form.echelonId === '' ? null : Number(form.echelonId),
        description: form.description || null,
        goals: form.goals || null,
        variations: form.variations || null,
        tips: form.tips || null,
        defaultText: form.defaultText || null,
        ballsCount: form.ballsCount,
        basketsCount: form.basketsCount,
        conesCount: form.conesCount,
        extraEquipment: form.extraEquipment || null,
        playersCount: form.playersCount,
        coachesCount: form.coachesCount,
        typeFundamental: form.typeFundamental,
        typeIndividual: form.typeIndividual,
        typeTeam: form.typeTeam,
        posGuard: form.posGuard,
        posForward: form.posForward,
        posCenter: form.posCenter,
        topicIds: selectedTopicIds,
      });
      showMessage(t('drill.save.updateSuccess'), 'success');
    } catch (e) {
      showMessage((e as Error)?.message || t('drill.save.error'), 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDrill.mutateAsync(drillId);
      router.push('/utilities/drills');
    } catch (e) {
      showMessage((e as Error)?.message || t('drill.save.deleteError'), 'error');
      setDeleteOpen(false);
    }
  };

  if (drillQuery.isLoading) {
    return (
      <PageContainer title={t('drill.edit')}>
        <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (drillQuery.error) {
    return (
      <PageContainer title={t('drill.edit')}>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{(drillQuery.error as Error).message}</Alert>
          <Button sx={{ mt: 2 }} onClick={() => router.push('/utilities/drills')}>
            {t('drill.backToList')}
          </Button>
        </Box>
      </PageContainer>
    );
  }

  const drill = drillQuery.data;
  if (!drill) {
    return (
      <PageContainer title={t('drill.edit')}>
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">{t('drill.save.notFound')}</Alert>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={t('drill.edit')} description={drill.title || ''}>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between', mb: 2 }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <IconButton onClick={() => router.push('/utilities/drills')}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {form.title || t('drill.new')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('drill.status.createdModified')} · {dayjs(drill.createdAt).format('DD/MM/YYYY')}
                {drill.updatedAt !== drill.createdAt
                  ? ` → ${dayjs(drill.updatedAt).format('DD/MM/YYYY')}`
                  : ''}
                {drill.account?.name ? ` · ${drill.account.name}` : ''}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteOpen(true)}
            >
              {t('actions.delete')}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saveDrill.isPending}
            >
              {t('actions.save')}
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
            gap: 2,
          }}
        >
          <Box>
            <GraphicsPanel
              drillId={drillId}
              graphics={drill.graphics ?? []}
              onMessage={showMessage}
            />
          </Box>

          <Stack spacing={2}>
            <Card>
              <CardContent>
                <TextField
                  fullWidth
                  required
                  label={t('drill.fields.title')}
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label={t('drill.fields.description')}
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label={t('drill.fields.goals')}
                    value={form.goals}
                    onChange={(e) => update('goals', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label={t('drill.fields.variations')}
                    value={form.variations}
                    onChange={(e) => update('variations', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label={t('drill.fields.tips')}
                    value={form.tips}
                    onChange={(e) => update('tips', e.target.value)}
                  />
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label={t('drill.fields.defaultText')}
                    value={form.defaultText}
                    onChange={(e) => update('defaultText', e.target.value)}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {t('drill.topics.title')}
                  </Typography>
                  <Button size="small" startIcon={<TagIcon />} onClick={() => setTopicsOpen(true)}>
                    {t('drill.topics.picker')}
                  </Button>
                </Stack>
                {selectedTopics.length === 0 ? (
                  <Typography color="text.secondary" variant="body2">
                    {t('drill.topics.none')}
                  </Typography>
                ) : (
                  <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                    {selectedTopics.map((topic) => (
                      <Chip key={topic.id} label={topicLabel(t, topic)} />
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {t('drill.fields.equipment')}
                  </Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={t('drill.fields.balls')}
                        value={form.ballsCount}
                        onChange={(e) => update('ballsCount', Number(e.target.value))}
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={t('drill.fields.baskets')}
                        value={form.basketsCount}
                        onChange={(e) => update('basketsCount', Number(e.target.value))}
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={t('drill.fields.cones')}
                        value={form.conesCount}
                        onChange={(e) => update('conesCount', Number(e.target.value))}
                        slotProps={{ htmlInput: { min: 0 } }}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      size="small"
                      label={t('drill.fields.extra')}
                      value={form.extraEquipment}
                      onChange={(e) => update('extraEquipment', e.target.value)}
                    />
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {t('drill.fields.playersCoaches')}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={t('drill.fields.players')}
                      value={form.playersCount}
                      onChange={(e) => update('playersCount', Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 0 } }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label={t('drill.fields.coaches')}
                      value={form.coachesCount}
                      onChange={(e) => update('coachesCount', Number(e.target.value))}
                      slotProps={{ htmlInput: { min: 0 } }}
                    />
                  </Stack>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('drill.fields.ageGroup')}</InputLabel>
                    <Select
                      label={t('drill.fields.ageGroup')}
                      value={form.echelonId}
                      onChange={(e) => {
                        const v = String(e.target.value);
                        update('echelonId', v === '' ? '' : Number(v));
                      }}
                    >
                      <MenuItem value="">
                        <em>{t('drill.fields.noEchelon')}</em>
                      </MenuItem>
                      {(echelonsQuery.data ?? [])
                        .filter(
                          (ech): ech is typeof ech & { id: number } =>
                            (ech as { id: number | null }).id != null
                        )
                        .map((ech) => (
                          <MenuItem key={ech.id} value={ech.id}>
                            {ech.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {t('drill.fields.type')}
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.typeFundamental}
                          onChange={(e) => update('typeFundamental', e.target.checked)}
                        />
                      }
                      label={t('drill.type.fundamental')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.typeIndividual}
                          onChange={(e) => update('typeIndividual', e.target.checked)}
                        />
                      }
                      label={t('drill.type.individual')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.typeTeam}
                          onChange={(e) => update('typeTeam', e.target.checked)}
                        />
                      }
                      label={t('drill.type.team')}
                    />
                  </FormGroup>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    {t('drill.fields.position')}
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.posGuard}
                          onChange={(e) => update('posGuard', e.target.checked)}
                        />
                      }
                      label={t('drill.position.guard')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.posForward}
                          onChange={(e) => update('posForward', e.target.checked)}
                        />
                      }
                      label={t('drill.position.forward')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.posCenter}
                          onChange={(e) => update('posCenter', e.target.checked)}
                        />
                      }
                      label={t('drill.position.center')}
                    />
                  </FormGroup>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Box>

        <Paper sx={{ mt: 3, p: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={() => router.push('/utilities/drills')}>{t('drill.backToList')}</Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saveDrill.isPending}
          >
            {t('actions.save')}
          </Button>
        </Paper>
      </Box>

      <TopicsDialog
        open={topicsOpen}
        topics={topicsQuery.data ?? []}
        selected={selectedTopicIds}
        canManage={canManageTopics}
        onClose={() => setTopicsOpen(false)}
        onSave={(ids) => {
          setSelectedTopicIds(ids);
          setTopicsOpen(false);
        }}
      />

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('drill.delete.title')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('drill.delete.confirm')} <strong>{drill.title || t('drill.singular')}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>{t('actions.cancel')}</Button>
          <Button
            color="error"
            variant="contained"
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
