'use client';

import React, { ReactElement, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import {
  useAttendanceReasons,
  useDeleteAttendanceReason,
  useSaveAttendanceReason,
} from '@/hooks/usePractices';
import { reasonLabel } from '@/lib/attendanceReasons';

interface Props {
  /** When false the list is rendered read-only (non-admin users). */
  canManage: boolean;
  /** Hide the local heading row when a parent container already
   * renders one (e.g. a wrapping accordion). */
  hideHeader?: boolean;
}

/** Inline editor for the club-scoped list of absence reasons. Renders as
 * read-only for non-admins so coaches can still see what is available. */
export default function AttendanceReasonsEditor({ canManage, hideHeader }: Props): ReactElement {
  const { t } = useTranslation();
  const reasonsQuery = useAttendanceReasons();
  const saveReason = useSaveAttendanceReason();
  const deleteReason = useDeleteAttendanceReason();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reasons = reasonsQuery.data ?? [];

  const handleAdd = async (): Promise<void> => {
    const name = newName.trim();
    if (!name) return;
    try {
      await saveReason.mutateAsync({ name });
      setNewName('');
      setError(null);
    } catch (e) {
      setError((e as Error)?.message || t('common.error'));
    }
  };

  const handleSaveEdit = async (id: number): Promise<void> => {
    const name = editingName.trim();
    if (!name) return;
    try {
      await saveReason.mutateAsync({ id, name });
      setEditingId(null);
      setEditingName('');
      setError(null);
    } catch (e) {
      setError((e as Error)?.message || t('common.error'));
    }
  };

  const handleDelete = async (id: number, name: string): Promise<void> => {
    const confirmed = window.confirm(t('practice.attendance.settings.deleteConfirm', { name }));
    if (!confirmed) return;
    try {
      await deleteReason.mutateAsync(id);
      setError(null);
    } catch (e) {
      setError((e as Error)?.message || t('common.error'));
    }
  };

  return (
    <Box>
      {!hideHeader ? (
        <>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t('practice.attendance.settings.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t('practice.attendance.settings.description')}
          </Typography>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t('practice.attendance.settings.description')}
        </Typography>
      )}

      {error ? (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={0.5} sx={{ mb: canManage ? 1.5 : 0 }}>
        {reasons.map((r) => {
          const isEditing = editingId === r.id;
          const label = reasonLabel(t, r);
          return (
            <Stack key={r.id} direction="row" sx={{ alignItems: 'center', gap: 1, py: 0.25 }}>
              {isEditing ? (
                <>
                  <TextField
                    size="small"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSaveEdit(r.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    sx={{ flex: 1 }}
                    autoFocus
                  />
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => void handleSaveEdit(r.id)}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingId(null);
                      setEditingName('');
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {label}
                  </Typography>
                  {canManage ? (
                    <>
                      <Tooltip title={t('actions.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingId(r.id);
                            setEditingName(label);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('actions.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => void handleDelete(r.id, label)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  ) : null}
                </>
              )}
            </Stack>
          );
        })}
      </Stack>

      {canManage ? (
        <Stack direction="row" sx={{ gap: 1 }}>
          <TextField
            size="small"
            placeholder={t('practice.attendance.settings.addPlaceholder')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleAdd();
            }}
            sx={{ flex: 1 }}
          />
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!newName.trim() || saveReason.isPending}
            onClick={() => void handleAdd()}
          >
            {t('actions.add')}
          </Button>
        </Stack>
      ) : null}
    </Box>
  );
}
