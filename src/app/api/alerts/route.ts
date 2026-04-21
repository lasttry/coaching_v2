import { NextResponse } from 'next/server';
import { AlertRecipientStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';

export async function GET(req: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accountId = Number(session.user.id);
  if (!accountId || Number.isNaN(accountId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const statusParam = (url.searchParams.get('status') || 'all').toLowerCase();

  const statusFilter: AlertRecipientStatus[] = (() => {
    switch (statusParam) {
      case 'unread':
        return [AlertRecipientStatus.UNREAD];
      case 'read':
        return [AlertRecipientStatus.READ];
      case 'all':
      default:
        return [AlertRecipientStatus.UNREAD, AlertRecipientStatus.READ];
    }
  })();

  try {
    const recipients = await prisma.alertRecipient.findMany({
      where: {
        accountId,
        status: { in: statusFilter },
      },
      include: {
        alert: true,
      },
      orderBy: [{ status: 'asc' }, { alert: { triggerDate: 'desc' } }, { createdAt: 'desc' }],
    });

    const [unreadCount, readCount] = await Promise.all([
      prisma.alertRecipient.count({
        where: { accountId, status: AlertRecipientStatus.UNREAD },
      }),
      prisma.alertRecipient.count({
        where: { accountId, status: AlertRecipientStatus.READ },
      }),
    ]);

    const items = recipients.map((r) => ({
      id: r.id,
      alertId: r.alertId,
      status: r.status,
      readAt: r.readAt,
      createdAt: r.createdAt,
      alert: {
        id: r.alert.id,
        type: r.alert.type,
        category: r.alert.category,
        title: r.alert.title,
        message: r.alert.message,
        linkUrl: r.alert.linkUrl,
        referenceType: r.alert.referenceType,
        referenceId: r.alert.referenceId,
        triggerDate: r.alert.triggerDate,
        expiresAt: r.alert.expiresAt,
        createdAt: r.alert.createdAt,
      },
    }));

    return NextResponse.json({
      items,
      counts: { unread: unreadCount, read: readCount },
    });
  } catch (error) {
    log.error('Failed to list alerts:', error);
    return NextResponse.json({ error: 'Failed to list alerts' }, { status: 500 });
  }
}
