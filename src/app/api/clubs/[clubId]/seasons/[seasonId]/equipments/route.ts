import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EquipmentInterface } from '@/types/equipment/types';
import { Size } from '@/types/game/types';

type Params = Promise<{ clubId: string; seasonId: string }>;

// GET /api/equipments?clubId=1
export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentInterface[]>> {
  const params = await segmentData.params;
  const clubId = Number(params.clubId);
  const seasonId = Number(params.seasonId);

  const equipments = await prisma.equipment.findMany({
    where: {
      clubId: clubId,
      seasonId: seasonId,
    },
    orderBy: { number: 'asc' },
  });

  const response: EquipmentInterface[] = equipments.map((e) => ({
    id: e.id,
    clubId: e.clubId,
    seasonId: e.seasonId,
    echelonId: e.echelonId,
    color: e.color,
    number: e.number,
    size: e.size,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));

  return NextResponse.json(response);
}

// POST /api/equipments
export async function POST(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentInterface | { error: string }>> {
  const params = await segmentData.params;
  const clubId = Number(params.clubId);
  const seasonId = Number(params.seasonId);

  let data: EquipmentInterface;

  try {
    data = (await req.json()) as EquipmentInterface;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const number = Number(data.number);
  const color = data.color?.trim();
  const echelonId = Number(data.echelonId);

  if (!color) {
    return NextResponse.json({ error: 'color is required' }, { status: 400 });
  }

  if (!number || Number.isNaN(number)) {
    return NextResponse.json({ error: 'number is required and must be a number' }, { status: 400 });
  }

  if (!echelonId || Number.isNaN(echelonId)) {
    return NextResponse.json(
      { error: 'echelon is required and must be a number' },
      { status: 400 }
    );
  }

  const size = data.size as Size;
  const created = await prisma.equipment.create({
    data: {
      club: {
        connect: { id: clubId }, // relação obrigatória: club
      },
      season: {
        connect: { id: seasonId }, // relação obrigatória: season
      },
      echelon: {
        connect: { id: echelonId },
      },
      color,
      size,
      number,
    },
  });

  const response: EquipmentInterface = {
    id: created.id,
    clubId: created.clubId,
    seasonId: created.seasonId,
    echelonId: created.echelonId,
    color: created.color,
    number: created.number,
    size: created.size,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };

  return NextResponse.json(response, { status: 201 });
}
