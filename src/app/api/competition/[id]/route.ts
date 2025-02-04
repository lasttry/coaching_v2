import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

type Params = Promise<{ id: number }>;

export async function PUT(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  try {
    const rawBody = await req.text();
    if (!rawBody) {
      return NextResponse.json({ error: 'Request body is empty.' }, { status: 400 });
    }

    const data = JSON.parse(rawBody);
    delete data.id;
    const echelonId = data.echelonId;
    delete data.echelonId;

    const payload = {
      where: { id },
      data: {
        ...data,
        echelon: echelonId ? { connect: { id: echelonId } } : undefined,
      },
      include: {
        echelon: true,
      },
    };
    log.debug(payload);
    const updatedCompetition = await prisma.competition.update(payload);
    log.debug(updatedCompetition);
    return NextResponse.json(updatedCompetition, { status: 200 });
  } catch (error) {
    log.error(error);
    return NextResponse.json({ error: 'Error updating competition' }, { status: 500 });
  }
}

export async function DELETE(req: Request, segmentData: { params: Params }): Promise<NextResponse> {
  const params = await segmentData.params;
  const id = Number(params.id);

  try {
    await prisma.competition.delete({
      where: { id },
    });
    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    log.error(error);
    return NextResponse.json({ error: 'Error deleting competition' }, { status: 500 });
  }
}
