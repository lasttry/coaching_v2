import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

async function requireAdminForReason(
  reasonId: number
): Promise<{ ok: true; clubId: number } | { ok: false; response: NextResponse }> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  const reason = await prisma.clubAttendanceReason.findUnique({
    where: { id: reasonId },
    select: { clubId: true },
  });
  if (!reason) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Not found' }, { status: 404 }),
    };
  }
  const membership = await prisma.accountClub.findUnique({
    where: {
      accountId_clubId: {
        accountId: Number(session.user.id),
        clubId: reason.clubId,
      },
    },
    include: { roles: true },
  });
  const isAdmin = !!membership?.roles.some((r) => r.role === Role.ADMIN);
  if (!isAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }
  return { ok: true, clubId: reason.clubId };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const reasonId = Number(id);
    const guard = await requireAdminForReason(reasonId);
    if (!guard.ok) return guard.response;

    const body = (await req.json()) as { name?: string; order?: number };
    const data: { name?: string; order?: number } = {};
    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
      }
      data.name = name.slice(0, 120);
    }
    if (body.order !== undefined && Number.isFinite(body.order)) {
      data.order = Number(body.order);
    }
    const reason = await prisma.clubAttendanceReason.update({
      where: { id: reasonId },
      data,
    });
    return NextResponse.json(reason);
  } catch (error) {
    log.error('Error updating attendance reason:', error);
    return NextResponse.json({ error: 'Failed to update reason' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const reasonId = Number(id);
    const guard = await requireAdminForReason(reasonId);
    if (!guard.ok) return guard.response;

    await prisma.clubAttendanceReason.delete({ where: { id: reasonId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error('Error deleting attendance reason:', error);
    return NextResponse.json({ error: 'Failed to delete reason' }, { status: 500 });
  }
}
