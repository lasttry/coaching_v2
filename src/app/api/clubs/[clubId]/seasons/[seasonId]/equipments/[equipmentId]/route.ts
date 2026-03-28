import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EquipmentInterface } from '@/types/equipment/types';
import { Size } from '@/types/game/types';

type Params = Promise<{ clubId: string; seasonId: string; equipmentId: string }>;

// GET /api/equipments/:id (opcional, mas dá jeito)
export async function GET(
  _req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentInterface | { error: string }>> {
  const params = await segmentData.params;
  const _clubId = Number(params.clubId);
  const _seasonId = Number(params.seasonId);
  const equipmentId = Number(params.equipmentId);

  if (!equipmentId || Number.isNaN(equipmentId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
  });

  if (!equipment) {
    return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
  }

  const response: EquipmentInterface = {
    id: equipment.id,
    clubId: equipment.clubId,
    seasonId: equipment.seasonId,
    echelonId: equipment.echelonId,
    color: equipment.color,
    number: equipment.number,
    size: equipment.size,
    createdAt: equipment.createdAt.toISOString(),
    updatedAt: equipment.updatedAt.toISOString(),
  };

  return NextResponse.json(response);
}

// PUT /api/equipments/:id  (UPDATE)
export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentInterface | { error: string }>> {
  const params = await segmentData.params;
  const clubId = Number(params.clubId);
  const seasonId = Number(params.seasonId);
  const equipmentId = Number(params.equipmentId);

  if (!equipmentId || Number.isNaN(equipmentId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let data: Partial<EquipmentInterface>;

  try {
    data = (await req.json()) as Partial<EquipmentInterface>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updateData: {
    clubId?: number;
    seasonId?: number;
    echelonId?: number;
    color?: string;
    number?: number;
    size?: Size;
  } = {};

  // opcionalmente, podemos garantir que o equipamento continua ligado
  // ao clube/época da rota
  if (!Number.isNaN(clubId) && clubId > 0) {
    updateData.clubId = clubId;
  }
  if (!Number.isNaN(seasonId) && seasonId > 0) {
    updateData.seasonId = seasonId;
  }

  if (data.number !== undefined) {
    const num = Number(data.number);
    if (Number.isNaN(num)) {
      return NextResponse.json({ error: 'number must be a number' }, { status: 400 });
    }
    updateData.number = num;
  }

  if ((data as { echelonId?: number | string }).echelonId !== undefined) {
    const rawEchelon = (data as { echelonId?: number | string }).echelonId;
    const echelonNum = Number(rawEchelon);
    if (Number.isNaN(echelonNum) || echelonNum <= 0) {
      return NextResponse.json({ error: 'echelonId must be a positive number' }, { status: 400 });
    }
    updateData.echelonId = echelonNum;
  }

  if (data.color !== undefined) {
    updateData.color = data.color.trim();
  }

  if (data.size !== undefined) {
    updateData.size = data.size as Size;
  }

  const updated = await prisma.equipment.update({
    where: { id: equipmentId },
    data: updateData,
  });

  const response: EquipmentInterface = {
    id: updated.id,
    clubId: updated.clubId,
    seasonId: updated.seasonId,
    echelonId: updated.echelonId,
    color: updated.color,
    number: updated.number,
    size: updated.size,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };

  return NextResponse.json(response);
}

// DELETE /api/equipments/:id  (DELETE)
export async function DELETE(
  _req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const params = await segmentData.params;
  const _clubId = Number(params.clubId);
  const _seasonId = Number(params.seasonId);
  const equipmentId = Number(params.equipmentId);

  if (!equipmentId || Number.isNaN(equipmentId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await prisma.equipment.delete({
    where: { id: equipmentId },
  });

  return NextResponse.json({ success: true });
}
