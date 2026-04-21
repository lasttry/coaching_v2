import type { AlertCategory, AlertRecipientStatus, AlertType } from '@prisma/client';

export interface AlertItem {
  id: number;
  type: AlertType;
  category: AlertCategory;
  title: string;
  message: string;
  linkUrl: string | null;
  referenceType: string | null;
  referenceId: number | null;
  triggerDate: string;
  expiresAt: string | null;
  createdAt: string;
}

export interface AlertRecipientItem {
  id: number;
  alertId: number;
  status: AlertRecipientStatus;
  readAt: string | null;
  createdAt: string;
  alert: AlertItem;
}

export interface AlertListResponse {
  items: AlertRecipientItem[];
  counts: { unread: number; read: number };
}
