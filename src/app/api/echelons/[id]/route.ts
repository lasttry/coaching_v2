import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

// GET: Retrieve a specific echelon
export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    log.error('Invalid ID parameter');
    return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 });
  }

  try {
    const echelon = await prisma.echelon.findUnique({ where: { id } });

    if (!echelon) {
      log.error(`Echelon with ID ${id} not found`);
      return NextResponse.json({ error: 'Echelon not found' }, { status: 404 });
    }

    log.info(`Echelon with ID ${id} fetched successfully:`, echelon);
    return NextResponse.json(echelon);
  } catch (error) {
    log.error(`Failed to fetch echelon with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch echelon' }, { status: 500 });
  }
}

// PUT: Update a specific echelon
export async function PUT(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    log.error('Invalid ID parameter');
    return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { minAge, maxAge, name, description, gender } = body;

    const updatedEchelon = await prisma.echelon.update({
      where: { id },
      data: { minAge, maxAge, name, description, gender },
    });

    log.info(`Echelon with ID ${id} updated successfully:`, updatedEchelon);
    return NextResponse.json(updatedEchelon);
  } catch (error) {
    log.error(`Failed to update echelon with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to update echelon' }, { status: 500 });
  }
}

// DELETE: Remove a specific echelon
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    log.error('Invalid ID parameter');
    return NextResponse.json({ error: 'Invalid ID parameter' }, { status: 400 });
  }

  try {
    await prisma.echelon.delete({ where: { id } });

    log.info(`Echelon with ID ${id} deleted successfully`);
    return NextResponse.json({ message: 'Echelon deleted successfully' });
  } catch (error) {
    log.error(`Failed to delete echelon with ID ${id}:`, error);
    return NextResponse.json({ error: 'Failed to delete echelon' }, { status: 500 });
  }
}
