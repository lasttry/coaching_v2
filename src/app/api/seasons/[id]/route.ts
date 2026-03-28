import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SeasonInterface } from '@/types/season/types';

type Params = Promise<{ id: string }>;

interface SeasonBody {
  name?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
}

// GET /api/seasons/:id
export async function GET(
  _req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<SeasonInterface | { error: string }>> {
  const { id } = await segmentData.params;

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const season = await prisma.season.findUnique({
    where: { id: Number(id) },
  });

  if (!season) {
    return NextResponse.json({ error: 'Season not found' }, { status: 404 });
  }

  const result: SeasonInterface = {
    id: season.id,
    name: season.name,
    startDate: season.startDate.toISOString(),
    endDate: season.endDate.toISOString(),
    isCurrent: season.isCurrent,
  };

  return NextResponse.json(result);
}

// PUT /api/seasons/:id
export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<SeasonInterface | { error: string }>> {
  const { id } = await segmentData.params;

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: SeasonBody;

  try {
    body = (await req.json()) as SeasonBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const dataToUpdate: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    isCurrent?: boolean;
  } = {};

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) {
      return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 });
    }
    dataToUpdate.name = name;
  }

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (body.startDate !== undefined) {
    startDate = new Date(body.startDate);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'startDate must be a valid date' }, { status: 400 });
    }
    dataToUpdate.startDate = startDate;
  }

  if (body.endDate !== undefined) {
    endDate = new Date(body.endDate);
    if (Number.isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'endDate must be a valid date' }, { status: 400 });
    }
    dataToUpdate.endDate = endDate;
  }

  if (startDate && endDate && startDate >= endDate) {
    return NextResponse.json({ error: 'startDate must be before endDate' }, { status: 400 });
  }

  const isCurrent = body.isCurrent;

  const updated = await prisma.$transaction(async (tx) => {
    if (isCurrent === true) {
      // Se esta passa a current, limpar as outras
      await tx.season.updateMany({
        where: { isCurrent: true, NOT: { id: Number(id) } },
        data: { isCurrent: false },
      });
      dataToUpdate.isCurrent = true;
    } else if (isCurrent === false) {
      dataToUpdate.isCurrent = false;
    }

    return tx.season.update({
      where: { id: Number(id) },
      data: dataToUpdate,
    });
  });

  const result: SeasonInterface = {
    id: updated.id,
    name: updated.name,
    startDate: updated.startDate.toISOString(),
    endDate: updated.endDate.toISOString(),
    isCurrent: updated.isCurrent,
  };

  return NextResponse.json(result);
}

// DELETE /api/seasons/:id
export async function DELETE(
  _req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const { id } = await segmentData.params;
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  // opcional: verificar se existem equipments ligados a esta season
  const countEquipments = await prisma.equipment.count({
    where: { id: Number(id) },
  });

  if (countEquipments > 0) {
    return NextResponse.json(
      { error: 'Cannot delete season with equipments associated' },
      { status: 400 }
    );
  }

  await prisma.season.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ success: true });
}
