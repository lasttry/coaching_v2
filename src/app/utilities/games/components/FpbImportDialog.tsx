'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import { log } from '@/lib/logger';
import { useOpponents } from '@/hooks/useOpponents';
import { useCompetitions } from '@/hooks/useCompetitions';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

interface FpbImportDialogProps {
  open: boolean;
  teamId: number | null;
  teamName?: string;
  onClose: () => void;
  onImported: () => void;
}

interface PlanEntry {
  fpbGameId: number | null;
  date: string | null;
  dateText: string;
  timeText: string;
  homeTeamName: string;
  awayTeamName: string;
  opponentName: string;
  competitionLabel: string | null;
  echelonLabel: string | null;
  venueName: string;
  away: boolean;
  suggestedOpponentId: number | null;
  suggestedCompetitionId: number | null;
  action: 'create' | 'skip-existing' | 'skip-date' | 'skip-own-team';
  reason?: string;
}

interface OpponentOption {
  id: number;
  name: string;
  shortName: string;
}

interface CompetitionSerieOption {
  id: number;
  name: string;
}

interface CompetitionOption {
  id: number;
  name: string;
  competitionSeries?: CompetitionSerieOption[];
}

interface RowSelection {
  selected: boolean;
  opponentId: number | null;
  competitionId: number | null;
  competitionSerieId: number | null;
}

type ImportResult = {
  results: Array<{
    fpbGameId: number | null;
    date: string;
    opponentId: number;
    status: 'created' | 'duplicate' | 'error';
    reason?: string;
  }>;
  counts: { created: number; duplicate: number; error: number };
};

function actionColor(action: PlanEntry['action']): 'success' | 'default' | 'warning' {
  switch (action) {
    case 'create':
      return 'success';
    case 'skip-existing':
      return 'default';
    case 'skip-date':
    case 'skip-own-team':
      return 'warning';
  }
}

const FpbImportDialog: React.FC<FpbImportDialogProps> = ({
  open,
  teamId,
  teamName,
  onClose,
  onImported,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanEntry[] | null>(null);
  const { data: opponentsData = [] } = useOpponents();
  const { data: competitionsData = [] } = useCompetitions();
  const opponents = useMemo<OpponentOption[]>(
    () =>
      opponentsData.map((o) => ({
        id: Number(o.id),
        name: o.name,
        shortName: o.shortName ?? '',
      })),
    [opponentsData]
  );
  const competitions = useMemo<CompetitionOption[]>(
    () =>
      competitionsData.map((c) => ({
        id: Number(c.id),
        name: c.name,
        competitionSeries: c.competitionSeries?.map((s) => ({
          id: Number(s.id),
          name: s.name,
        })),
      })),
    [competitionsData]
  );
  const [selections, setSelections] = useState<Record<string, RowSelection>>({});
  const [result, setResult] = useState<ImportResult | null>(null);

  const rowKey = useCallback(
    (entry: PlanEntry): string =>
      entry.fpbGameId ? `fpb-${entry.fpbGameId}` : `${entry.dateText}-${entry.opponentName}`,
    []
  );

  const loadPreview = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    setResult(null);
    try {
      const planRes = await fetch(`/api/teams/${teamId}/fpb-import`);

      if (!planRes.ok) {
        const data = await planRes.json().catch(() => ({}));
        throw new Error(data?.error || 'Preview failed');
      }

      const planData = (await planRes.json()) as { plan: PlanEntry[] };

      const freshSelections: Record<string, RowSelection> = {};
      planData.plan.forEach((entry) => {
        if (entry.action !== 'create') return;
        freshSelections[rowKey(entry)] = {
          selected: true,
          opponentId: entry.suggestedOpponentId,
          competitionId: entry.suggestedCompetitionId,
          competitionSerieId: null,
        };
      });

      setPlan(planData.plan);
      setSelections(freshSelections);
    } catch (err) {
      log.error('FPB preview failed:', err);
      setError(err instanceof Error ? err.message : t('fpbImport.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [teamId, t, rowKey]);

  useEffect(() => {
    if (open && teamId) {
      loadPreview();
    }
    if (!open) {
      setPlan(null);
      setResult(null);
      setError(null);
      setSelections({});
    }
  }, [open, teamId, loadPreview]);

  const toCreate = useMemo(() => plan?.filter((p) => p.action === 'create') ?? [], [plan]);

  const selectedToCreate = useMemo(
    () => toCreate.filter((entry) => selections[rowKey(entry)]?.selected),
    [toCreate, selections, rowKey]
  );

  const readyToImport = useMemo(() => {
    if (selectedToCreate.length === 0) return false;
    return selectedToCreate.every((entry) => {
      const sel = selections[rowKey(entry)];
      return sel && sel.opponentId && sel.competitionId;
    });
  }, [selectedToCreate, selections, rowKey]);

  const seriesFor = useCallback(
    (competitionId: number | null): CompetitionSerieOption[] => {
      if (!competitionId) return [];
      const c = competitions.find((x) => x.id === competitionId);
      return c?.competitionSeries ?? [];
    },
    [competitions]
  );

  const updateSelection = (key: string, patch: Partial<RowSelection>): void => {
    setSelections((prev) => {
      const current: RowSelection = prev[key] ?? {
        selected: true,
        opponentId: null,
        competitionId: null,
        competitionSerieId: null,
      };
      return {
        ...prev,
        [key]: { ...current, ...patch },
      };
    });
  };

  const handleImport = async (): Promise<void> => {
    if (!teamId || !plan) return;
    setImporting(true);
    setError(null);
    try {
      const games = selectedToCreate.map((entry) => {
        const sel = selections[rowKey(entry)];
        return {
          fpbGameId: entry.fpbGameId,
          date: entry.date,
          away: entry.away,
          venueName: entry.venueName,
          opponentId: sel.opponentId!,
          competitionId: sel.competitionId!,
          competitionSerieId: sel.competitionSerieId ?? null,
        };
      });

      const res = await fetch(`/api/teams/${teamId}/fpb-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ games }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setResult(data as ImportResult);
      onImported();
    } catch (err) {
      log.error('FPB import failed:', err);
      setError(err instanceof Error ? err.message : t('fpbImport.importError'));
    } finally {
      setImporting(false);
    }
  };

  // Guard the dialog only while there are user-editable selections in flight.
  // Snapshot is captured the moment the preview finishes loading, so any
  // toggle from the suggested defaults marks the form as dirty. Once an
  // import finishes the dialog only displays a result and no longer needs
  // the prompt.
  const guardOpen = open && !!plan && !result;
  const isImportDirty = useFormSnapshotDirty(guardOpen, selections);

  return (
    <GuardedDialog open={open} onClose={onClose} isDirty={isImportDirty} maxWidth="lg" fullWidth>
      <DialogTitle>
        {t('fpbImport.title')}
        {teamName ? ` — ${teamName}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && plan && !result && (
          <>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t('fpbImport.previewSummary', {
                total: plan.length,
                toCreate: toCreate.length,
              })}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        size="small"
                        indeterminate={
                          selectedToCreate.length > 0 && selectedToCreate.length < toCreate.length
                        }
                        checked={toCreate.length > 0 && selectedToCreate.length === toCreate.length}
                        disabled={toCreate.length === 0}
                        onChange={(_, checked) => {
                          setSelections((prev) => {
                            const next = { ...prev };
                            toCreate.forEach((entry) => {
                              const k = rowKey(entry);
                              const current: RowSelection = next[k] ?? {
                                selected: true,
                                opponentId: null,
                                competitionId: null,
                                competitionSerieId: null,
                              };
                              next[k] = { ...current, selected: checked };
                            });
                            return next;
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>{t('common.date')}</TableCell>
                    <TableCell sx={{ minWidth: 220 }}>{t('fpbImport.fpbOpponent')}</TableCell>
                    <TableCell sx={{ minWidth: 240 }}>{t('opponent.singular')}</TableCell>
                    <TableCell sx={{ minWidth: 260 }}>{t('competition.singular')}</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>{t('competition.series')}</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>{t('common.status')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plan.map((entry) => {
                    const key = rowKey(entry);
                    const sel = selections[key];
                    const series = sel ? seriesFor(sel.competitionId) : [];
                    const isCreate = entry.action === 'create';
                    const unchecked = isCreate && sel?.selected === false;
                    const disabled = !isCreate || unchecked;
                    return (
                      <TableRow key={key} sx={{ opacity: unchecked ? 0.5 : 1 }}>
                        <TableCell padding="checkbox">
                          {isCreate && (
                            <Checkbox
                              size="small"
                              checked={sel?.selected ?? true}
                              onChange={(_, checked) => updateSelection(key, { selected: checked })}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {entry.date
                                ? dayjs(entry.date).format('DD/MM/YYYY HH:mm')
                                : `${entry.dateText} ${entry.timeText}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {entry.venueName || '-'}
                              {entry.away ? ` · ${t('fpbImport.away')}` : ''}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">{entry.opponentName || '-'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {entry.competitionLabel || ''}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            disabled={disabled}
                            options={opponents}
                            getOptionLabel={(o) => o.name}
                            value={opponents.find((o) => o.id === sel?.opponentId) ?? null}
                            onChange={(_, value) =>
                              updateSelection(key, { opponentId: value?.id ?? null })
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={t('opponent.singular')}
                                error={isCreate && !unchecked && !sel?.opponentId}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            disabled={disabled}
                            options={competitions}
                            getOptionLabel={(c) => c.name}
                            value={competitions.find((c) => c.id === sel?.competitionId) ?? null}
                            onChange={(_, value) =>
                              updateSelection(key, {
                                competitionId: value?.id ?? null,
                                competitionSerieId: null,
                              })
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={t('competition.singular')}
                                error={isCreate && !unchecked && !sel?.competitionId}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            disabled={disabled || !sel?.competitionId || series.length === 0}
                            options={series}
                            getOptionLabel={(s) => s.name}
                            value={series.find((s) => s.id === sel?.competitionSerieId) ?? null}
                            onChange={(_, value) =>
                              updateSelection(key, { competitionSerieId: value?.id ?? null })
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={
                                  series.length === 0
                                    ? t('fpbImport.noSeries')
                                    : t('competition.series')
                                }
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={actionColor(entry.action)}
                            label={t(`fpbImport.action.${entry.action}`)}
                            title={entry.reason || undefined}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {!loading && result && (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {t('fpbImport.resultSummary', {
                imported: result.counts.created,
                skipped: result.counts.duplicate,
                errors: result.counts.error,
              })}
            </Alert>
            {result.results
              .filter((r) => r.status === 'error')
              .map((r, i) => (
                <Typography key={i} variant="body2" color="error">
                  {dayjs(r.date).format('DD/MM/YYYY HH:mm')} — {r.reason}
                </Typography>
              ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{result ? t('actions.close') : t('actions.cancel')}</Button>
        {!result && plan && toCreate.length > 0 && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={importing || !readyToImport}
            startIcon={importing ? <CircularProgress size={16} /> : undefined}
          >
            {t('fpbImport.importCount', { count: selectedToCreate.length })}
          </Button>
        )}
      </DialogActions>
    </GuardedDialog>
  );
};

export default FpbImportDialog;
