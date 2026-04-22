import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EquipmentInterface } from '@/types/equipment/types';
import { Size } from '@prisma/client';

type Params = Promise<{ clubId: string; seasonId: string; colorId: string; equipmentId: string }>;

export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentInterface | { error: string }>> {
  const params = await segmentData.params;
  const equipmentId = Number(params.equipmentId);

  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    include: {
      equipmentColor: true,
    },
  });

  if (!equipment) {
    return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
  }

  const response: EquipmentInterface = {
    id: equipment.id,
    equipmentColorId: equipment.equipmentColorId,
    equipmentColor: equipment.equipmentColor
      ? {
          id: equipment.equipmentColor.id,
          clubId: equipment.equipmentColor.clubId,
          seasonId: equipment.equipmentColor.seasonId,
          echelonId: equipment.equipmentColor.echelonId,
          color: equipment.equipmentColor.color,
          colorHex: equipment.equipmentColor.colorHex,
          numberColorHex: equipment.equipmentColor.numberColorHex,
        }
      : undefined,
    number: equipment.number,
    size: equipment.size,
    createdAt: equipment.createdAt.toISOString(),
    updatedAt: equipment.updatedAt.toISOString(),
  };

  return NextResponse.json(response);
}

export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentInterface | { error: string }>> {
  const params = await segmentData.params;
  const equipmentId = Number(params.equipmentId);

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
    include: {
      equipmentColor: true,
    },
  });

  const response: EquipmentInterface = {
    id: updated.id,
    equipmentColorId: updated.equipmentColorId,
    equipmentColor: updated.equipmentColor
      ? {
          id: updated.equipmentColor.id,
          clubId: updated.equipmentColor.clubId,
          seasonId: updated.equipmentColor.seasonId,
          echelonId: updated.equipmentColor.echelonId,
          color: updated.equipmentColor.color,
          colorHex: updated.equipmentColor.colorHex,
          numberColorHex: updated.equipmentColor.numberColorHex,
        }
      : undefined,
    number: updated.number,
    size: updated.size,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };

  return NextResponse.json(response);
}

export async function DELETE(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const params = await segmentData.params;
  const equipmentId = Number(params.equipmentId);

  await prisma.equipment.delete({
    where: { id: equipmentId },
  });

  return NextResponse.json({ success: true });
}
