'use client';

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';

import { useDrills, useDrillTopics } from '@/hooks/useDrills';
import { topicLabel } from '@/lib/drillTopics';
import type { DrillInterface } from '@/types/drills/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (drill: DrillInterface) => void | Promise<void>;
}

/** Picker dialog that lets the coach attach an exercise from their own
 * drill library to a practice. Supports a quick text search over the
 * title and a topic filter mirrors the drills page. */
export default function DrillPickerDialog({ open, onClose, onPick }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [topicId, setTopicId] = useState<number | null>(null);

  const drillsQuery = useDrills({
    search: search.trim() || undefined,
    topicId: topicId ?? undefined,
  });
  const topicsQuery = useDrillTopics();

  const drills = useMemo(() => drillsQuery.data ?? [], [drillsQuery.data]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('practice.items.pickDrill')}</DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <TextField
            size="small"
            fullWidth
            autoFocus
            placeholder={t('practice.items.searchDrill')}
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
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              size="small"
              label={t('drill.filters.allTopics')}
              color={topicId == null ? 'primary' : 'default'}
              onClick={() => setTopicId(null)}
              variant={topicId == null ? 'filled' : 'outlined'}
            />
            {(topicsQuery.data ?? []).map((topic) => (
              <Chip
                key={topic.id}
                size="small"
                label={topicLabel(t, topic)}
                color={topicId === topic.id ? 'primary' : 'default'}
                variant={topicId === topic.id ? 'filled' : 'outlined'}
                onClick={() => setTopicId(topic.id)}
              />
            ))}
          </Stack>

          {drillsQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : drills.length === 0 ? (
            <Alert severity="info">{t('drill.list.emptyFiltered')}</Alert>
          ) : (
            <List
              dense
              sx={{
                maxHeight: 360,
                overflow: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              {drills.map((d) => (
                <ListItemButton
                  key={d.id}
                  onClick={() => void onPick(d)}
                  sx={{ alignItems: 'flex-start' }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 600 }}>
                        {d.title || d.name || `#${d.id}`}
                      </Typography>
                    }
                    secondary={
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.25 }}
                      >
                        {(d.topics ?? []).slice(0, 4).map((tp) => (
                          <Chip
                            key={tp.id}
                            size="small"
                            label={topicLabel(t, tp)}
                            variant="outlined"
                          />
                        ))}
                        {d.echelon ? <Chip size="small" label={d.echelon.name} /> : null}
                      </Stack>
                    }
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('actions.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
}
