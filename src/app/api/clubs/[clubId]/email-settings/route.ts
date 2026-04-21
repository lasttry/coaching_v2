import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { encryptSecret } from '@/lib/email/crypto';

type Params = Promise<{ clubId: string }>;

interface PublicEmailSettings {
  enabled: boolean;
  host: string | null;
  port: number | null;
  secure: boolean;
  user: string | null;
  fromEmail: string | null;
  fromName: string | null;
  replyTo: string | null;
  hasPassword: boolean;
}

interface UpdatePayload {
  enabled?: boolean;
  host?: string | null;
  port?: number | null;
  secure?: boolean;
  user?: string | null;
  password?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
  replyTo?: string | null;
  clearPassword?: boolean;
}

async function requireClubAdmin(clubId: number): Promise<{ error: NextResponse } | { ok: true }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const membership = await prisma.accountClub.findUnique({
    where: {
      accountId_clubId: {
        accountId: Number(session.user.id),
        clubId,
      },
    },
    include: { roles: true },
  });

  if (!membership) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  const isAdmin = membership.roles.some((r) => r.role === Role.ADMIN);
  if (!isAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { ok: true };
}

function toPublic(
  settings: {
    enabled: boolean;
    host: string | null;
    port: number | null;
    secure: boolean;
    user: string | null;
    passEncrypted: string | null;
    fromEmail: string | null;
    fromName: string | null;
    replyTo: string | null;
  } | null
): PublicEmailSettings {
  return {
    enabled: settings?.enabled ?? false,
    host: settings?.host ?? null,
    port: settings?.port ?? null,
    secure: settings?.secure ?? true,
    user: settings?.user ?? null,
    fromEmail: settings?.fromEmail ?? null,
    fromName: settings?.fromName ?? null,
    replyTo: settings?.replyTo ?? null,
    hasPassword: Boolean(settings?.passEncrypted),
  };
}

export async function GET(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const { clubId: clubIdStr } = await segmentData.params;
  const clubId = Number(clubIdStr);
  if (!Number.isFinite(clubId)) {
    return NextResponse.json({ error: 'Invalid clubId' }, { status: 400 });
  }

  const guard = await requireClubAdmin(clubId);
  if ('error' in guard) return guard.error;

  try {
    const settings = await prisma.clubEmailSettings.findUnique({
      where: { clubId },
    });
    return NextResponse.json(toPublic(settings));
  } catch (error) {
    log.error('Failed to load club email settings:', error);
    return NextResponse.json({ error: 'Failed to load email settings' }, { status: 500 });
  }
}

export async function PUT(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const { clubId: clubIdStr } = await segmentData.params;
  const clubId = Number(clubIdStr);
  if (!Number.isFinite(clubId)) {
    return NextResponse.json({ error: 'Invalid clubId' }, { status: 400 });
  }

  const guard = await requireClubAdmin(clubId);
  if ('error' in guard) return guard.error;

  try {
    const body = (await req.json()) as UpdatePayload;

    const baseData: {
      enabled?: boolean;
      host?: string | null;
      port?: number | null;
      secure?: boolean;
      user?: string | null;
      fromEmail?: string | null;
      fromName?: string | null;
      replyTo?: string | null;
      passEncrypted?: string | null;
    } = {};
    if (body.enabled !== undefined) baseData.enabled = Boolean(body.enabled);
    if (body.host !== undefined) baseData.host = body.host || null;
    if (body.port !== undefined) baseData.port = body.port ? Number(body.port) : null;
    if (body.secure !== undefined) baseData.secure = Boolean(body.secure);
    if (body.user !== undefined) baseData.user = body.user || null;
    if (body.fromEmail !== undefined) baseData.fromEmail = body.fromEmail || null;
    if (body.fromName !== undefined) baseData.fromName = body.fromName || null;
    if (body.replyTo !== undefined) baseData.replyTo = body.replyTo || null;

    // Password handling: only change when explicitly requested.
    if (body.clearPassword) {
      baseData.passEncrypted = null;
    } else if (typeof body.password === 'string' && body.password.length > 0) {
      baseData.passEncrypted = encryptSecret(body.password);
    }

    const settings = await prisma.clubEmailSettings.upsert({
      where: { clubId },
      update: baseData,
      create: {
        clubId,
        enabled: baseData.enabled ?? false,
        host: baseData.host ?? null,
        port: baseData.port ?? null,
        secure: baseData.secure ?? true,
        user: baseData.user ?? null,
        passEncrypted: baseData.passEncrypted ?? null,
        fromEmail: baseData.fromEmail ?? null,
        fromName: baseData.fromName ?? null,
        replyTo: baseData.replyTo ?? null,
      },
    });

    return NextResponse.json(toPublic(settings));
  } catch (error) {
    log.error('Failed to update club email settings:', error);
    const message = error instanceof Error ? error.message : 'Failed to update email settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
