import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EquipmentInterface, EquipmentPayload } from '@/types/equipment/type';
import { Size } from '@/types/game/types';

// GET /api/equipments?clubId=1
export async function GET(req: NextRequest): Promise<NextResponse<EquipmentInterface[]>> {
  const { searchParams } = new URL(req.url);
  const clubIdParam = searchParams.get('clubId');

  const where = clubIdParam ? { clubId: Number(clubIdParam) } : {};

  const equipments = await prisma.equipment.findMany({
    where,
    orderBy: { number: 'asc' },
  });

  const response: EquipmentInterface[] = equipments.map((e) => ({
    id: e.id,
    clubId: e.clubId,
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
  req: NextRequest
): Promise<NextResponse<EquipmentInterface | { error: string }>> {
  let data: EquipmentPayload;

  try {
    data = (await req.json()) as EquipmentPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const clubId = Number(data.clubId);
  const number = Number(data.number);
  const color = data.color?.trim();

  if (!clubId || Number.isNaN(clubId)) {
    return NextResponse.json({ error: 'clubId is required and must be a number' }, { status: 400 });
  }

  if (!color) {
    return NextResponse.json({ error: 'color is required' }, { status: 400 });
  }

  if (!number || Number.isNaN(number)) {
    return NextResponse.json({ error: 'number is required and must be a number' }, { status: 400 });
  }

  const size = data.size as Size;
  const created = await prisma.equipment.create({
    data: {
      clubId,
      color,
      size,
      number,
    },
  });

  const response: EquipmentInterface = {
    id: created.id,
    clubId: created.clubId,
    color: created.color,
    number: created.number,
    size: created.size,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };

  return NextResponse.json(response, { status: 201 });
}
