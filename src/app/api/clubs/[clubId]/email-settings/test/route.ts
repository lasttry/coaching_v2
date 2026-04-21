import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { sendEmailForClub } from '@/lib/email/sender';

type Params = Promise<{ clubId: string }>;

/**
 * Sends a short test email using the club's configured SMTP settings.
 * Body: { to: string }
 */
export async function POST(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const { clubId: clubIdStr } = await segmentData.params;
  const clubId = Number(clubIdStr);
  if (!Number.isFinite(clubId)) {
    return NextResponse.json({ error: 'Invalid clubId' }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const membership = await prisma.accountClub.findUnique({
    where: {
      accountId_clubId: { accountId: Number(session.user.id), clubId },
    },
    include: { roles: true },
  });
  const isAdmin = membership?.roles.some((r) => r.role === Role.ADMIN) ?? false;
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { to } = (await req.json()) as { to?: string };
  if (!to || !/^.+@.+\..+$/.test(to)) {
    return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 });
  }

  try {
    const club = await prisma.club.findUnique({
      where: { id: clubId },
      select: { name: true },
    });
    const clubName = club?.name || `club #${clubId}`;

    const result = await sendEmailForClub(clubId, {
      to,
      subject: `[Test] Email settings OK — ${clubName}`,
      text: `This is a test message sent from the coaching application using the SMTP settings configured for "${clubName}". If you received this, outgoing email is working.`,
      html: `<p>This is a <strong>test message</strong> sent from the coaching application using the SMTP settings configured for <em>${clubName}</em>.</p><p>If you received this, outgoing email is working.</p>`,
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });
  } catch (error) {
    log.error('Failed to send test email:', error);
    const message = error instanceof Error ? error.message : 'Failed to send test email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
