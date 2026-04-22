import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EquipmentColorInterface } from '@/types/equipmentColor/types';

type Params = Promise<{ clubId: string; seasonId: string }>;

export async function GET(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentColorInterface[]>> {
  const params = await segmentData.params;
  const clubId = Number(params.clubId);
  const seasonId = Number(params.seasonId);

  const { searchParams } = new URL(req.url);
  const echelonId = searchParams.get('echelon.singular');

  const equipmentColors = await prisma.equipmentColor.findMany({
    where: {
      clubId,
      seasonId,
      ...(echelonId ? { echelonId: Number(echelonId) } : {}),
    },
    include: {
      echelon: true,
      equipments: {
        orderBy: { number: 'asc' },
      },
    },
    orderBy: [{ echelonId: 'asc' }, { color: 'asc' }],
  });

  const response: EquipmentColorInterface[] = equipmentColors.map((ec) => ({
    id: ec.id,
    clubId: ec.clubId,
    seasonId: ec.seasonId,
    echelonId: ec.echelonId,
    echelon: ec.echelon
      ? {
          id: ec.echelon.id,
          name: ec.echelon.name,
          minAge: ec.echelon.minAge,
          maxAge: ec.echelon.maxAge,
          description: ec.echelon.description ?? '',
          gender: ec.echelon.gender,
        }
      : undefined,
    color: ec.color,
    colorHex: ec.colorHex,
    numberColorHex: ec.numberColorHex,
    equipments: ec.equipments.map((e) => ({
      id: e.id,
      equipmentColorId: e.equipmentColorId,
      number: e.number,
      size: e.size,
    })),
    createdAt: ec.createdAt.toISOString(),
    updatedAt: ec.updatedAt.toISOString(),
  }));

  return NextResponse.json(response);
}

export async function POST(
  req: NextRequest,
  segmentData: { params: Params }
): Promise<NextResponse<EquipmentColorInterface | { error: string }>> {
  const params = await segmentData.params;
  const clubId = Number(params.clubId);
  const seasonId = Number(params.seasonId);

  let data: {
    color: string;
    colorHex?: string;
    numberColorHex?: string;
    echelonId: number;
  };

  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const color = data.color?.trim();
  const colorHex = data.colorHex?.trim() || '#000000';
  const numberColorHex = data.numberColorHex?.trim() || '#FFFFFF';
  const echelonId = Number(data.echelonId);

  if (!color) {
    return NextResponse.json({ error: 'color is required' }, { status: 400 });
  }

  if (!echelonId || Number.isNaN(echelonId)) {
    return NextResponse.json({ error: 'echelonId is required' }, { status: 400 });
  }

  const existing = await prisma.equipmentColor.findFirst({
    where: { clubId, seasonId, echelonId, color },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'This color already exists for this echelon' },
      { status: 400 }
    );
  }

  const created = await prisma.equipmentColor.create({
    data: {
      club: { connect: { id: clubId } },
      season: { connect: { id: seasonId } },
      echelon: { connect: { id: echelonId } },
      color,
      colorHex,
      numberColorHex,
    },
    include: {
      echelon: true,
      equipments: true,
    },
  });

  const response: EquipmentColorInterface = {
    id: created.id,
    clubId: created.clubId,
    seasonId: created.seasonId,
    echelonId: created.echelonId,
    echelon: created.echelon
      ? {
          id: created.echelon.id,
          name: created.echelon.name,
          minAge: created.echelon.minAge,
          maxAge: created.echelon.maxAge,
          description: created.echelon.description ?? '',
          gender: created.echelon.gender,
        }
      : undefined,
    color: created.color,
    colorHex: created.colorHex,
    numberColorHex: created.numberColorHex,
    equipments: [],
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };

  return NextResponse.json(response, { status: 201 });
}
