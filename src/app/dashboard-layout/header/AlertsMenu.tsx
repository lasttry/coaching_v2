'use client';

import React, { ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Popover,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import { IconBellRinging } from '@tabler/icons-react';
import { AlertRecipientStatus, AlertType } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import { log } from '@/lib/logger';
import type { AlertListResponse, AlertRecipientItem } from '@/types/alerts/types';
import AlertDetailDialog from './AlertDetailDialog';

const POLL_INTERVAL_MS = 60_000;

const TYPE_COLOR: Record<AlertType, string> = {
  INFO: 'info.main',
  ATTENTION: 'warning.light',
  IMPORTANT: 'warning.main',
  PRIORITY: 'error.main',
};

type TabValue = 'active' | 'seen';

function formatRelative(
  triggerDate: Date,
  now: Date,
  t: (key: string, opts?: Record<string, unknown>) => string
): string {
  const MS_IN_DAY = 24 * 60 * 60 * 1000;
  const a = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const b = Date.UTC(
    triggerDate.getUTCFullYear(),
    triggerDate.getUTCMonth(),
    triggerDate.getUTCDate()
  );
  const diff = Math.round((b - a) / MS_IN_DAY);
  if (diff === 0) return t('alerts.relative.today');
  if (diff > 0) {
    return diff === 1
      ? t('alerts.relative.inDays', { count: diff })
      : t('alerts.relative.inDays_plural', { count: diff });
  }
  const ago = Math.abs(diff);
  return ago === 1
    ? t('alerts.relative.daysAgo', { count: ago })
    : t('alerts.relative.daysAgo_plural', { count: ago });
}

export default function AlertsMenu(): ReactElement {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tab, setTab] = useState<TabValue>('active');
  const [items, setItems] = useState<AlertRecipientItem[]>([]);
  const [counts, setCounts] = useState<{ unread: number; read: number }>({ unread: 0, read: 0 });
  const [loading, setLoading] = useState(false);
  const [detailRecipient, setDetailRecipient] = useState<AlertRecipientItem | null>(null);
  const mountedRef = React.useRef(true);

  const fetchAlerts = useCallback(async (signal?: AbortSignal): Promise<void> => {
    if (!mountedRef.current) return;
    try {
      setLoading(true);
      const res = await fetch('/api/alerts?status=all', { signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as AlertListResponse;
      if (!mountedRef.current || signal?.aborted) return;
      setItems(data.items);
      setCounts(data.counts);
    } catch (err) {
      if ((err as { name?: string } | undefined)?.name === 'AbortError') return;
      log.error('Failed to fetch alerts:', err);
    } finally {
      if (mountedRef.current && !signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();
    void fetchAlerts(controller.signal);
    const id = window.setInterval(() => void fetchAlerts(controller.signal), POLL_INTERVAL_MS);
    return (): void => {
      mountedRef.current = false;
      controller.abort();
      window.clearInterval(id);
    };
  }, [fetchAlerts]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    void fetchAlerts();
  };

  const handleClose = (): void => setAnchorEl(null);

  const handleMarkRead = useCallback(async (recipient: AlertRecipientItem): Promise<void> => {
    try {
      const res = await fetch(`/api/alerts/${recipient.alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READ' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) =>
        prev.map((r) =>
          r.id === recipient.id
            ? { ...r, status: AlertRecipientStatus.READ, readAt: new Date().toISOString() }
            : r
        )
      );
      setCounts((c) => ({
        unread: Math.max(0, c.unread - (recipient.status === AlertRecipientStatus.UNREAD ? 1 : 0)),
        read: c.read + (recipient.status === AlertRecipientStatus.UNREAD ? 1 : 0),
      }));
    } catch (err) {
      log.error('Failed to mark alert read:', err);
    }
  }, []);

  const handleMarkUnread = useCallback(async (recipient: AlertRecipientItem): Promise<void> => {
    try {
      const res = await fetch(`/api/alerts/${recipient.alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'UNREAD' }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) =>
        prev.map((r) =>
          r.id === recipient.id ? { ...r, status: AlertRecipientStatus.UNREAD, readAt: null } : r
        )
      );
      setCounts((c) => ({
        unread: c.unread + (recipient.status === AlertRecipientStatus.READ ? 1 : 0),
        read: Math.max(0, c.read - (recipient.status === AlertRecipientStatus.READ ? 1 : 0)),
      }));
    } catch (err) {
      log.error('Failed to mark alert unread:', err);
    }
  }, []);

  const handleDelete = useCallback(async (recipient: AlertRecipientItem): Promise<void> => {
    try {
      const res = await fetch(`/api/alerts/${recipient.alertId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems((prev) => prev.filter((r) => r.id !== recipient.id));
      setCounts((c) => ({
        unread: Math.max(0, c.unread - (recipient.status === AlertRecipientStatus.UNREAD ? 1 : 0)),
        read: Math.max(0, c.read - (recipient.status === AlertRecipientStatus.READ ? 1 : 0)),
      }));
    } catch (err) {
      log.error('Failed to delete alert:', err);
    }
  }, []);

  const filteredItems = useMemo(() => {
    const wanted = tab === 'active' ? AlertRecipientStatus.UNREAD : AlertRecipientStatus.READ;
    return items.filter((r) => r.status === wanted);
  }, [items, tab]);

  const open = Boolean(anchorEl);
  const now = useMemo(() => new Date(), []);

  return (
    <>
      <IconButton
        size="large"
        color="inherit"
        aria-label={t('alerts.title')}
        aria-haspopup="true"
        onClick={handleOpen}
      >
        <Badge badgeContent={counts.unread} color="error" overlap="circular">
          <IconBellRinging size="21" stroke="1.5" />
        </Badge>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 320, sm: 400 },
              maxHeight: 520,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            {t('alerts.title')}
          </Typography>
          {loading && <CircularProgress size={16} />}
        </Box>
        <Tabs
          value={tab}
          onChange={(_, v: TabValue) => setTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="active" label={`${t('alerts.tabs.active')} (${counts.unread})`} />
          <Tab value="seen" label={`${t('alerts.tabs.seen')} (${counts.read})`} />
        </Tabs>
        <Box sx={{ overflowY: 'auto', flex: 1 }}>
          {filteredItems.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {tab === 'active' ? t('alerts.emptyActive') : t('alerts.emptySeen')}
              </Typography>
            </Box>
          ) : (
            filteredItems.map((recipient, idx) => {
              const { alert } = recipient;
              const color = TYPE_COLOR[alert.type];
              const isUnread = recipient.status === AlertRecipientStatus.UNREAD;
              const triggerDate = new Date(alert.triggerDate);
              return (
                <React.Fragment key={recipient.id}>
                  {idx > 0 && <Divider />}
                  <Box
                    onClick={() => setDetailRecipient(recipient)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      backgroundColor: isUnread ? 'action.hover' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        alignSelf: 'stretch',
                        borderRadius: 2,
                        backgroundColor: color,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: isUnread ? 600 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {alert.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {alert.message}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatRelative(triggerDate, now, t)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isUnread ? (
                        <Tooltip title={t('alerts.actions.markRead')}>
                          <IconButton
                            component="span"
                            size="small"
                            onClick={() => void handleMarkRead(recipient)}
                          >
                            <DoneAllIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title={t('alerts.actions.markUnread')}>
                          <IconButton
                            component="span"
                            size="small"
                            onClick={() => void handleMarkUnread(recipient)}
                          >
                            <MarkEmailUnreadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t('alerts.actions.delete')}>
                        <IconButton
                          component="span"
                          size="small"
                          color="error"
                          onClick={() => void handleDelete(recipient)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </React.Fragment>
              );
            })
          )}
        </Box>
      </Popover>
      <AlertDetailDialog
        open={Boolean(detailRecipient)}
        recipient={detailRecipient}
        onClose={() => setDetailRecipient(null)}
        onMarkRead={(r) => void handleMarkRead(r)}
        onMarkUnread={(r) => void handleMarkUnread(r)}
        onDelete={(r) => void handleDelete(r)}
      />
    </>
  );
}
