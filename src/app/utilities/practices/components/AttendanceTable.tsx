'use client';

import React, { ReactElement, useCallback, useMemo } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CancelIcon from '@mui/icons-material/Cancel';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import { useAttendanceReasons } from '@/hooks/usePractices';
import { reasonLabel } from '@/lib/attendanceReasons';
import type { ClubAttendanceReasonInterface } from '@/types/practices/types';

export interface AttendanceRow {
  athleteId: number;
  name: string;
  number?: string | null;
  photo?: string | null;
  /** Coach-set expectation: this athlete should be at the session. */
  hasToAttend: boolean;
  /** Whether the athlete actually showed up — `null` while unrecorded. */
  attended: boolean | null;
  lateMinutes: number | null;
  absenceReasonId: number | null;
  absenceNotes: string;
}

interface Props {
  rows: AttendanceRow[];
  onChange: (athleteId: number, patch: Partial<AttendanceRow>) => void;
  /** When provided, renders "Select all" / "Clear" buttons in the
   * header that bulk-toggle the "Has to attend" checkbox. */
  onToggleAll?: (value: boolean) => void;
  /** Hide the "Attended" / "Not attended" controls. Handy for new
   * practices where only the expected roster is being chosen. */
  showPresenceColumns?: boolean;
  /** Message shown in place of the table body. */
  emptyMessage?: string;
}

/* Width of the "name + photo" leading block. Keeping it fixed makes the
 * presence/absence icons line up across rows regardless of athlete name. */
const NAME_COLUMN_WIDTH = 220;
/* Width reserved for the leading "has to attend" toggle so that the
 * name column always starts at the same x-position. */
const HAS_TO_ATTEND_COLUMN_WIDTH = 36;

export default function AttendanceTable({
  rows,
  onChange,
  onToggleAll,
  showPresenceColumns = true,
  emptyMessage,
}: Props): ReactElement {
  const { t } = useTranslation();
  const reasonsQuery = useAttendanceReasons();
  const reasons = reasonsQuery.data ?? [];
  const reasonsLoading = reasonsQuery.isLoading;

  const { hasToAttendCount, attendedCount } = useMemo(() => {
    let expected = 0;
    let present = 0;
    for (const r of rows) {
      if (r.hasToAttend) expected += 1;
      if (r.attended === true) present += 1;
    }
    return { hasToAttendCount: expected, attendedCount: present };
  }, [rows]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {t('practice.attendance.rosterTitle')}
        </Typography>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip
            size="small"
            label={t('practice.attendance.expectedCount', {
              count: hasToAttendCount,
              total: rows.length,
            })}
            color={hasToAttendCount > 0 ? 'primary' : 'default'}
          />
          {showPresenceColumns ? (
            <Chip
              size="small"
              label={t('practice.attendance.attendedCount', {
                count: attendedCount,
                total: hasToAttendCount || rows.length,
              })}
              color={attendedCount > 0 ? 'success' : 'default'}
            />
          ) : null}
          {onToggleAll ? (
            <>
              <Button size="small" onClick={() => onToggleAll(true)} disabled={rows.length === 0}>
                {t('practice.attendance.selectAll')}
              </Button>
              <Button size="small" onClick={() => onToggleAll(false)} disabled={rows.length === 0}>
                {t('practice.attendance.deselectAll')}
              </Button>
            </>
          ) : null}
        </Stack>
      </Stack>

      {rows.length === 0 ? (
        emptyMessage ? (
          <Alert severity="info" sx={{ my: 1 }}>
            {emptyMessage}
          </Alert>
        ) : null
      ) : (
        <Stack
          sx={{
            maxHeight: 460,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            p: 1,
            gap: 1,
            backgroundColor: 'background.default',
          }}
        >
          {rows.map((row) => (
            <AttendanceRowCard
              key={row.athleteId}
              row={row}
              onChange={onChange}
              showPresenceColumns={showPresenceColumns}
              reasons={reasons}
              reasonsLoading={reasonsLoading}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}

/* ------------------- Row ------------------- */

interface RowProps {
  row: AttendanceRow;
  onChange: (athleteId: number, patch: Partial<AttendanceRow>) => void;
  showPresenceColumns: boolean;
  reasons: ClubAttendanceReasonInterface[];
  reasonsLoading: boolean;
}

const AttendanceRowCard = React.memo(function AttendanceRowCard({
  row,
  onChange,
  showPresenceColumns,
  reasons,
  reasonsLoading,
}: RowProps): ReactElement {
  const { t } = useTranslation();
  const isAttended = row.attended === true;
  const isAbsent = row.attended === false;
  const isLateChecked = isAttended && row.lateMinutes !== null;

  const handleHasToAttendToggle = useCallback(() => {
    if (row.hasToAttend) {
      onChange(row.athleteId, {
        hasToAttend: false,
        attended: null,
        lateMinutes: null,
        absenceReasonId: null,
        absenceNotes: '',
      });
    } else {
      onChange(row.athleteId, { hasToAttend: true });
    }
  }, [onChange, row.athleteId, row.hasToAttend]);

  const handleMarkAttended = useCallback(() => {
    onChange(row.athleteId, {
      attended: isAttended ? null : true,
      lateMinutes: null,
      absenceReasonId: null,
      absenceNotes: '',
    });
  }, [onChange, row.athleteId, isAttended]);

  const handleMarkAbsent = useCallback(() => {
    onChange(row.athleteId, {
      attended: isAbsent ? null : false,
      lateMinutes: null,
      absenceReasonId: isAbsent ? null : row.absenceReasonId,
      absenceNotes: '',
    });
  }, [onChange, row.athleteId, isAbsent, row.absenceReasonId]);

  const handleToggleLate = useCallback(() => {
    onChange(row.athleteId, {
      lateMinutes: isLateChecked ? null : 0,
    });
  }, [onChange, row.athleteId, isLateChecked]);

  const handleChangeLateMinutes = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const raw = event.target.value;
      const n = raw === '' ? 0 : Math.max(0, Math.round(Number(raw)));
      onChange(row.athleteId, {
        lateMinutes: Number.isFinite(n as number) ? n : 0,
      });
    },
    [onChange, row.athleteId]
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        borderRadius: 1.5,
        borderColor: row.hasToAttend ? 'divider' : 'action.disabledBackground',
        backgroundColor: row.hasToAttend ? 'background.paper' : 'action.hover',
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          justifyContent: 'flex-start',
        }}
      >
        {/* Has-to-attend toggle (always in the same column). */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            width: HAS_TO_ATTEND_COLUMN_WIDTH,
            minWidth: HAS_TO_ATTEND_COLUMN_WIDTH,
            flexShrink: 0,
          }}
        >
          <Tooltip title={t('practice.attendance.hasToAttend')}>
            <IconButton size="small" onClick={handleHasToAttendToggle}>
              {row.hasToAttend ? (
                <CheckCircleIcon color="primary" fontSize="small" />
              ) : (
                <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Athlete identity column. */}
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 1,
            width: NAME_COLUMN_WIDTH,
            minWidth: NAME_COLUMN_WIDTH,
            flexShrink: 0,
          }}
        >
          {row.photo ? (
            <Avatar src={row.photo} sx={{ width: 28, height: 28 }} />
          ) : (
            <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
              {(row.name || '?').slice(0, 1).toUpperCase()}
            </Avatar>
          )}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              opacity: row.hasToAttend ? 1 : 0.6,
            }}
            title={row.name}
          >
            {row.name}
          </Typography>
        </Stack>

        {showPresenceColumns ? (
          <Stack
            direction="row"
            sx={{ alignItems: 'center', gap: 0.5, flexShrink: 0, flexWrap: 'wrap' }}
          >
            <Tooltip title={t('practice.attendance.markAttended')}>
              <span>
                <IconButton size="small" disabled={!row.hasToAttend} onClick={handleMarkAttended}>
                  {isAttended ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t('practice.attendance.markAbsent')}>
              <span>
                <IconButton size="small" disabled={!row.hasToAttend} onClick={handleMarkAbsent}>
                  {isAbsent ? (
                    <CancelIcon color="error" fontSize="small" />
                  ) : (
                    <CancelIcon fontSize="small" color="disabled" />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            {isAttended ? (
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, ml: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('practice.attendance.lateBy')}
                </Typography>
                <IconButton size="small" disabled={!row.hasToAttend} onClick={handleToggleLate}>
                  {isLateChecked ? (
                    <CheckCircleIcon color="primary" fontSize="small" />
                  ) : (
                    <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                  )}
                </IconButton>
                {isLateChecked ? (
                  <>
                    <TextField
                      type="number"
                      size="small"
                      value={row.lateMinutes ?? 0}
                      onChange={handleChangeLateMinutes}
                      slotProps={{
                        htmlInput: { min: 0, max: 600, style: { textAlign: 'center' } },
                      }}
                      sx={{ width: 76 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {t('practice.attendance.min')}
                    </Typography>
                  </>
                ) : null}
              </Stack>
            ) : null}

            {isAbsent ? (
              <FormControl
                size="small"
                sx={{ minWidth: 200, ml: 0.5, flexShrink: 0 }}
                disabled={!row.hasToAttend || reasonsLoading}
              >
                <InputLabel>{t('practice.attendance.reason')}</InputLabel>
                <Select<number | ''>
                  label={t('practice.attendance.reason')}
                  value={row.absenceReasonId ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    onChange(row.athleteId, {
                      absenceReasonId: v === '' || v == null ? null : Number(v),
                    });
                  }}
                  MenuProps={{ slotProps: { paper: { sx: { maxHeight: 360 } } } }}
                >
                  <MenuItem value="">
                    <em>—</em>
                  </MenuItem>
                  {reasons.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {reasonLabel(t, r)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
});
