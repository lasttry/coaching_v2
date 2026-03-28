import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = Promise<{ clubId: string; seasonId: string }>;

interface EquipmentWithColorResponse {
  id: number;
  equipmentColorId: number;
  number: number;
  size: string;
  color: string;
  colorHex: string;
  echelonId: number;
  clubId: number;
  seasonId: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentWithColorResponse[]>> {
  const params = await segmentData.params;
  const clubId = Number(params.clubId);
  const seasonId = Number(params.seasonId);

  const equipments = await prisma.equipment.findMany({
    where: {
      equipmentColor: {
        clubId,
        seasonId,
      },
    },
    include: {
      equipmentColor: true,
    },
    orderBy: { number: 'asc' },
  });

  const response: EquipmentWithColorResponse[] = equipments.map((e) => ({
    id: e.id,
    equipmentColorId: e.equipmentColorId,
    number: e.number,
    size: e.size,
    color: e.equipmentColor.color,
    colorHex: e.equipmentColor.colorHex,
    echelonId: e.equipmentColor.echelonId,
    clubId: e.equipmentColor.clubId,
    seasonId: e.equipmentColor.seasonId,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return NextResponse.json(response);
}
