import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { EquipmentInterface, EquipmentPayload } from '@/types/equipment/type';
import { Size } from '@/types/game/types';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/equipments/:id (opcional, mas dá jeito)
export async function GET(
  _req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<EquipmentInterface | { error: string }>> {
  const id = Number(params.id);

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!equipment) {
    return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
  }

  const response: EquipmentInterface = {
    id: equipment.id,
    clubId: equipment.clubId,
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
  { params }: RouteParams
): Promise<NextResponse<EquipmentInterface | { error: string }>> {
  const id = Number(params.id);

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let data: Partial<EquipmentPayload>;

  try {
    data = (await req.json()) as Partial<EquipmentPayload>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updateData: {
    clubId?: number;
    color?: string;
    number?: number;
    size?: Size;
  } = {};

  if (data.clubId !== undefined) {
    const clubId = Number(data.clubId);
    if (Number.isNaN(clubId)) {
      return NextResponse.json({ error: 'clubId must be a number' }, { status: 400 });
    }
    updateData.clubId = clubId;
  }

  if (data.number !== undefined) {
    const num = Number(data.number);
    if (Number.isNaN(num)) {
      return NextResponse.json({ error: 'number must be a number' }, { status: 400 });
    }
    updateData.number = num;
  }

  if (data.color !== undefined) {
    updateData.color = data.color.trim();
  }

  if (data.size !== undefined) {
    updateData.size = data.size as Size;
  }

  const updated = await prisma.equipment.update({
    where: { id },
    data: updateData,
  });

  const response: EquipmentInterface = {
    id: updated.id,
    clubId: updated.clubId,
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
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  const id = Number(params.id);

  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await prisma.equipment.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}