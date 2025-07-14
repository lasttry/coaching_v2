import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { CompetitionSerieInterface } from '@/types/competition/types';

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
        ...(data.competitionSeries && {
          competitionSeries: {
            deleteMany: { competitionId: id },
            create: data.competitionSeries.map((serie: CompetitionSerieInterface) => ({
              name: serie.name,
            })),
          },
        }),
      },
      include: {
        echelon: true,
        competitionSeries: true,
      },
    };

    const updatedCompetition = await prisma.competition.update(payload);
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
