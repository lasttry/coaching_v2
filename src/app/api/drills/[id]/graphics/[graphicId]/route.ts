import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

type GraphicGuard =
  | { error: NextResponse; graphic?: undefined }
  | { error?: undefined; graphic: NonNullable<Awaited<ReturnType<typeof findGraphic>>> };

async function findGraphic(graphicId: number) {
  return prisma.drillGraphic.findUnique({
    where: { id: graphicId },
    include: { drill: { select: { id: true, clubId: true } } },
  });
}

async function resolveGraphic(
  drillId: number,
  graphicId: number,
  clubId: number
): Promise<GraphicGuard> {
  const graphic = await findGraphic(graphicId);
  if (!graphic || graphic.drillId !== drillId) {
    return { error: NextResponse.json({ error: 'Graphic not found' }, { status: 404 }) };
  }
  if (graphic.drill.clubId !== clubId) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { graphic };
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; graphicId: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !session.user.selectedClubId ||
      isNaN(Number(session.user.selectedClubId))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clubId = Number(session.user.selectedClubId);
    const { id, graphicId } = await ctx.params;
    const guard = await resolveGraphic(Number(id), Number(graphicId), clubId);
    if (guard.error) return guard.error;

    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body?.svg === 'string') data.svg = body.svg;
    if ('notes' in body) data.notes = body.notes ?? null;

    const graphic = await prisma.drillGraphic.update({
      where: { id: Number(graphicId) },
      data,
    });
    return NextResponse.json(graphic);
  } catch (error) {
    log.error('Error updating graphic:', error);
    return NextResponse.json({ error: 'Failed to update graphic' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; graphicId: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !session.user.selectedClubId ||
      isNaN(Number(session.user.selectedClubId))
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clubId = Number(session.user.selectedClubId);
    const { id, graphicId } = await ctx.params;
    const guard = await resolveGraphic(Number(id), Number(graphicId), clubId);
    if (guard.error) return guard.error;

    await prisma.drillGraphic.delete({ where: { id: Number(graphicId) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    log.error('Error deleting graphic:', error);
    return NextResponse.json({ error: 'Failed to delete graphic' }, { status: 500 });
  }
}
