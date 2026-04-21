'use client';

import React, { ReactElement } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { AlertRecipientStatus, AlertType } from '@prisma/client';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n.client';
import type { AlertRecipientItem } from '@/types/alerts/types';

const TYPE_COLOR: Record<AlertType, string> = {
  INFO: 'info.main',
  ATTENTION: 'warning.light',
  IMPORTANT: 'warning.main',
  PRIORITY: 'error.main',
};

interface Props {
  open: boolean;
  recipient: AlertRecipientItem | null;
  onClose: () => void;
  onMarkRead: (recipient: AlertRecipientItem) => void;
  onMarkUnread: (recipient: AlertRecipientItem) => void;
  onDelete: (recipient: AlertRecipientItem) => void;
}

export default function AlertDetailDialog({
  open,
  recipient,
  onClose,
  onMarkRead,
  onMarkUnread,
  onDelete,
}: Props): ReactElement | null {
  const { t } = useTranslation();

  if (!recipient) return null;
  const { alert } = recipient;
  const color = TYPE_COLOR[alert.type];
  const isUnread = recipient.status === AlertRecipientStatus.UNREAD;

  const triggerDate = new Date(alert.triggerDate);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pr: 1,
        }}
      >
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
          }}
        />
        <Typography variant="h6" sx={{ flex: 1, lineHeight: 1.3 }}>
          {alert.title}
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label={t('alerts.actions.close')}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
          {t(`alerts.types.${alert.type.toLowerCase()}` as const)} ·{' '}
          {triggerDate.toLocaleDateString()}
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {alert.message}
        </Typography>
        {alert.linkUrl && (
          <Box sx={{ mt: 2 }}>
            <MuiLink
              href={alert.linkUrl}
              target="_blank"
              rel="noopener"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
            >
              {t('alerts.actions.open')}
              <OpenInNewIcon fontSize="small" />
            </MuiLink>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Button
          color="error"
          onClick={() => {
            onDelete(recipient);
            onClose();
          }}
        >
          {t('alerts.actions.delete')}
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isUnread ? (
            <Button
              variant="contained"
              onClick={() => {
                onMarkRead(recipient);
                onClose();
              }}
            >
              {t('alerts.actions.markRead')}
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={() => {
                onMarkUnread(recipient);
                onClose();
              }}
            >
              {t('alerts.actions.markUnread')}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
