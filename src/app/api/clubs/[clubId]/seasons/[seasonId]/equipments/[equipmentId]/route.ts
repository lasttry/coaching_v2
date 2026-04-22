import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Size } from '@prisma/client';

type Params = Promise<{ clubId: string; seasonId: string; equipmentId: string }>;

interface EquipmentWithColorResponse {
  id: number;
  equipmentColorId: number;
  number: number;
  size: string;
  color: string;
  colorHex: string;
  numberColorHex: string;
  echelonId: number;
  clubId: number;
  seasonId: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(
  _req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentWithColorResponse | { error: string }>> {
  const params = await segmentData.params;
  const equipmentId = Number(params.equipmentId);

  if (!equipmentId || Number.isNaN(equipmentId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    include: { equipmentColor: true },
  });

  if (!equipment) {
    return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
  }

  const response: EquipmentWithColorResponse = {
    id: equipment.id,
    equipmentColorId: equipment.equipmentColorId,
    number: equipment.number,
    size: equipment.size,
    color: equipment.equipmentColor.color,
    colorHex: equipment.equipmentColor.colorHex,
    numberColorHex: equipment.equipmentColor.numberColorHex,
    echelonId: equipment.equipmentColor.echelonId,
    clubId: equipment.equipmentColor.clubId,
    seasonId: equipment.equipmentColor.seasonId,
    createdAt: equipment.createdAt.toISOString(),
    updatedAt: equipment.updatedAt.toISOString(),
  };

  return NextResponse.json(response);
}

export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentWithColorResponse | { error: string }>> {
  const params = await segmentData.params;
  const equipmentId = Number(params.equipmentId);

  if (!equipmentId || Number.isNaN(equipmentId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let data: { number?: number; size?: string };

  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updateData: { number?: number; size?: Size } = {};

  if (data.number !== undefined) {
    updateData.number = Number(data.number);
  }
  if (data.size !== undefined) {
    updateData.size = data.size as Size;
  }

  const updated = await prisma.equipment.update({
    where: { id: equipmentId },
    data: updateData,
    include: { equipmentColor: true },
  });

  const response: EquipmentWithColorResponse = {
    id: updated.id,
    equipmentColorId: updated.equipmentColorId,
    number: updated.number,
    size: updated.size,
    color: updated.equipmentColor.color,
    colorHex: updated.equipmentColor.colorHex,
    numberColorHex: updated.equipmentColor.numberColorHex,
    echelonId: updated.equipmentColor.echelonId,
    clubId: updated.equipmentColor.clubId,
    seasonId: updated.equipmentColor.seasonId,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };

  return NextResponse.json(response);
}

export async function DELETE(
  _req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const params = await segmentData.params;
  const equipmentId = Number(params.equipmentId);

  if (!equipmentId || Number.isNaN(equipmentId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await prisma.equipment.delete({
    where: { id: equipmentId },
  });

  return NextResponse.json({ success: true });
}
