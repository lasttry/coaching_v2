import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EquipmentInterface } from '@/types/equipment/types';
import { Size } from '@prisma/client';

type Params = Promise<{ clubId: string; seasonId: string; colorId: string }>;

export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentInterface[]>> {
  const params = await segmentData.params;
  const colorId = Number(params.colorId);

  const equipments = await prisma.equipment.findMany({
    where: { equipmentColorId: colorId },
    include: {
      equipmentColor: true,
    },
    orderBy: { number: 'asc' },
  });

  const response: EquipmentInterface[] = equipments.map((e) => ({
    id: e.id,
    equipmentColorId: e.equipmentColorId,
    equipmentColor: e.equipmentColor
      ? {
          id: e.equipmentColor.id,
          clubId: e.equipmentColor.clubId,
          seasonId: e.equipmentColor.seasonId,
          echelonId: e.equipmentColor.echelonId,
          color: e.equipmentColor.color,
          colorHex: e.equipmentColor.colorHex,
          numberColorHex: e.equipmentColor.numberColorHex,
        }
      : undefined,
    number: e.number,
    size: e.size,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return NextResponse.json(response);
}

export async function POST(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentInterface | { error: string }>> {
  const params = await segmentData.params;
  const colorId = Number(params.colorId);

  let data: { number: number; size: string };

  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const number = Number(data.number);
  const size = data.size as Size;

  if (!number || Number.isNaN(number)) {
    return NextResponse.json({ error: 'number is required' }, { status: 400 });
  }

  if (!size) {
    return NextResponse.json({ error: 'size is required' }, { status: 400 });
  }

  const created = await prisma.equipment.create({
    data: {
      equipmentColor: { connect: { id: colorId } },
      number,
      size,
    },
    include: {
      equipmentColor: true,
    },
  });

  const response: EquipmentInterface = {
    id: created.id,
    equipmentColorId: created.equipmentColorId,
    equipmentColor: created.equipmentColor
      ? {
          id: created.equipmentColor.id,
          clubId: created.equipmentColor.clubId,
          seasonId: created.equipmentColor.seasonId,
          echelonId: created.equipmentColor.echelonId,
          color: created.equipmentColor.color,
          colorHex: created.equipmentColor.colorHex,
          numberColorHex: created.equipmentColor.numberColorHex,
        }
      : undefined,
    number: created.number,
    size: created.size,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };

  return NextResponse.json(response, { status: 201 });
}
