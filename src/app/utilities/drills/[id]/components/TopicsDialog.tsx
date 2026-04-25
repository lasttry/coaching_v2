'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';
import type { DrillTopicInterface } from '@/types/drills/types';
import { useDeleteDrillTopic, useSaveDrillTopic } from '@/hooks/useDrills';
import { topicLabel } from '@/lib/drillTopics';
import { GuardedDialog, useFormSnapshotDirty } from '@/app/components/shared/GuardedDialog';

interface Props {
  open: boolean;
  topics: DrillTopicInterface[];
  selected: number[];
  /** True when the current user can create/rename/delete topics (club
   * ADMIN). When false the dialog renders as a simple checkbox picker. */
  canManage?: boolean;
  onClose: () => void;
  onSave: (ids: number[]) => void | Promise<void>;
  saving?: boolean;
}

export default function TopicsDialog({
  open,
  topics,
  selected,
  canManage = false,
  onClose,
  onSave,
  saving,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const [local, setLocal] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [newName, setNewName] = useState('');

  const { mutateAsync: saveTopic, isPending: savingTopic } = useSaveDrillTopic();
  const { mutateAsync: removeTopic, isPending: removingTopic } = useDeleteDrillTopic();

  useEffect(() => {
    if (open) {
      setLocal(new Set(selected));
      setEditingId(null);
      setNewName('');
    }
  }, [open, selected]);

  const sorted = useMemo(
    () => [...topics].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [topics]
  );

  // The snapshot baseline includes the picker selection plus any in-flight
  // editing/new-topic text so the guard catches both selection changes and
  // half-typed new-topic names.
  const isDirty = useFormSnapshotDirty(open, {
    selection: [...local].sort(),
    editingId,
    editingValue,
    newName,
  });

  const toggle = (id: number) => {
    setLocal((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const startEdit = (topic: DrillTopicInterface) => {
    setEditingId(topic.id);
    setEditingValue(topic.name);
  };

  const commitEdit = async () => {
    if (editingId == null) return;
    const name = editingValue.trim();
    if (!name) {
      setEditingId(null);
      return;
    }
    await saveTopic({ id: editingId, name });
    setEditingId(null);
  };

  const addTopic = async () => {
    const name = newName.trim();
    if (!name) return;
    await saveTopic({ name });
    setNewName('');
  };

  const deleteTopic = async (id: number) => {
    if (!window.confirm(t('drill.topics.deleteConfirm'))) return;
    await removeTopic(id);
    setLocal((prev) => {
      if (!prev.has(id)) return prev;
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const manageBusy = savingTopic || removingTopic;

  return (
    <GuardedDialog open={open} onClose={onClose} isDirty={isDirty} maxWidth="xs" fullWidth>
      <DialogTitle>{t('drill.topics.picker')}</DialogTitle>
      <DialogContent dividers>
        {sorted.length === 0 ? (
          <Typography color="text.secondary">{t('drill.topics.none')}</Typography>
        ) : (
          <FormGroup>
            <Stack spacing={0.25}>
              {sorted.map((topic) => {
                const isEditing = editingId === topic.id;
                return (
                  <Box
                    key={topic.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      minHeight: 40,
                    }}
                  >
                    {isEditing ? (
                      <Stack direction="row" spacing={0.5} sx={{ flex: 1, alignItems: 'center' }}>
                        <TextField
                          size="small"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') void commitEdit();
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          fullWidth
                          slotProps={{ htmlInput: { maxLength: 120 } }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => void commitEdit()}
                          disabled={manageBusy}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => setEditingId(null)}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    ) : (
                      <>
                        <FormControlLabel
                          sx={{ flex: 1, mr: 0 }}
                          control={
                            <Checkbox
                              checked={local.has(topic.id)}
                              onChange={() => toggle(topic.id)}
                            />
                          }
                          label={topicLabel(t, topic)}
                        />
                        {canManage && (
                          <Stack direction="row" spacing={0}>
                            <Tooltip title={t('actions.edit')}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => startEdit(topic)}
                                  disabled={manageBusy}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={t('actions.delete')}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => void deleteTopic(topic.id)}
                                  disabled={manageBusy}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        )}
                      </>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </FormGroup>
        )}

        {canManage && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <TextField
                size="small"
                fullWidth
                placeholder={t('drill.topics.addPlaceholder')}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void addTopic();
                }}
                slotProps={{ htmlInput: { maxLength: 120 } }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => void addTopic()}
                disabled={manageBusy || !newName.trim()}
              >
                {t('actions.add')}
              </Button>
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.cancel')}</Button>
        <Button variant="contained" onClick={() => void onSave([...local])} disabled={saving}>
          {t('drill.topics.save')}
        </Button>
      </DialogActions>
    </GuardedDialog>
  );
}
