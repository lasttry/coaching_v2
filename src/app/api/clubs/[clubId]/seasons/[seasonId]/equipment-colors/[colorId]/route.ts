import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EquipmentColorInterface } from '@/types/equipmentColor/types';

type Params = Promise<{ clubId: string; seasonId: string; colorId: string }>;

export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentColorInterface | { error: string }>> {
  const params = await segmentData.params;
  const colorId = Number(params.colorId);

  const equipmentColor = await prisma.equipmentColor.findUnique({
    where: { id: colorId },
    include: {
      echelon: true,
      equipments: {
        orderBy: { number: 'asc' },
      },
    },
  });

  if (!equipmentColor) {
    return NextResponse.json({ error: 'Equipment color not found' }, { status: 404 });
  }

  const response: EquipmentColorInterface = {
    id: equipmentColor.id,
    clubId: equipmentColor.clubId,
    seasonId: equipmentColor.seasonId,
    echelonId: equipmentColor.echelonId,
    echelon: equipmentColor.echelon
      ? {
          id: equipmentColor.echelon.id,
          name: equipmentColor.echelon.name,
          minAge: equipmentColor.echelon.minAge,
          maxAge: equipmentColor.echelon.maxAge,
          description: equipmentColor.echelon.description ?? '',
          gender: equipmentColor.echelon.gender,
        }
      : undefined,
    color: equipmentColor.color,
    colorHex: equipmentColor.colorHex,
    numberColorHex: equipmentColor.numberColorHex,
    equipments: equipmentColor.equipments.map((e) => ({
      id: e.id,
      equipmentColorId: e.equipmentColorId,
      number: e.number,
      size: e.size,
    })),
    createdAt: equipmentColor.createdAt.toISOString(),
    updatedAt: equipmentColor.updatedAt.toISOString(),
  };

  return NextResponse.json(response);
}

export async function PUT(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentColorInterface | { error: string }>> {
  const params = await segmentData.params;
  const colorId = Number(params.colorId);

  let data: { color?: string; colorHex?: string; numberColorHex?: string };

  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updateData: { color?: string; colorHex?: string; numberColorHex?: string } = {};

  if (data.color !== undefined) {
    updateData.color = data.color.trim();
  }
  if (data.colorHex !== undefined) {
    updateData.colorHex = data.colorHex.trim();
  }
  if (data.numberColorHex !== undefined) {
    updateData.numberColorHex = data.numberColorHex.trim();
  }

  const updated = await prisma.equipmentColor.update({
    where: { id: colorId },
    data: updateData,
    include: {
      echelon: true,
      equipments: {
        orderBy: { number: 'asc' },
      },
    },
  });

  const response: EquipmentColorInterface = {
    id: updated.id,
    clubId: updated.clubId,
    seasonId: updated.seasonId,
    echelonId: updated.echelonId,
    echelon: updated.echelon
      ? {
          id: updated.echelon.id,
          name: updated.echelon.name,
          minAge: updated.echelon.minAge,
          maxAge: updated.echelon.maxAge,
          description: updated.echelon.description ?? '',
          gender: updated.echelon.gender,
        }
      : undefined,
    color: updated.color,
    colorHex: updated.colorHex,
    numberColorHex: updated.numberColorHex,
    equipments: updated.equipments.map((e) => ({
      id: e.id,
      equipmentColorId: e.equipmentColorId,
      number: e.number,
      size: e.size,
    })),
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
  const colorId = Number(params.colorId);

  await prisma.equipmentColor.delete({
    where: { id: colorId },
  });

  return NextResponse.json({ success: true });
}
