import { NextResponse } from 'next/server';
import { AlertRecipientStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { log } from '@/lib/logger';

type Params = Promise<{ id: string }>;

export async function PATCH(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accountId = Number(session.user.id);
  const params = await segmentData.params;
  const alertId = Number(params.id);

  if (!alertId || Number.isNaN(alertId)) {
    return NextResponse.json({ error: 'Invalid alert id' }, { status: 400 });
  }

  let body: { status?: string };
  try {
    body = (await req.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const requested = (body.status || '').toUpperCase();
  if (requested !== AlertRecipientStatus.READ && requested !== AlertRecipientStatus.UNREAD) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const recipient = await prisma.alertRecipient.findUnique({
      where: { alertId_accountId: { alertId, accountId } },
    });
    if (!recipient) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const updated = await prisma.alertRecipient.update({
      where: { id: recipient.id },
      data: {
        status: requested as AlertRecipientStatus,
        readAt: requested === AlertRecipientStatus.READ ? new Date() : null,
      },
    });

    return NextResponse.json({ id: updated.id, status: updated.status, readAt: updated.readAt });
  } catch (error) {
    log.error('Failed to update alert recipient:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}

export async function DELETE(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accountId = Number(session.user.id);
  const params = await segmentData.params;
  const alertId = Number(params.id);

  if (!alertId || Number.isNaN(alertId)) {
    return NextResponse.json({ error: 'Invalid alert id' }, { status: 400 });
  }

  try {
    const recipient = await prisma.alertRecipient.findUnique({
      where: { alertId_accountId: { alertId, accountId } },
    });
    if (!recipient) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    await prisma.alertRecipient.update({
      where: { id: recipient.id },
      data: {
        status: AlertRecipientStatus.DELETED,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Failed to delete alert recipient:', error);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
