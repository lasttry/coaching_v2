import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { log } from '@/lib/logger';

const prisma = new PrismaClient();

// GET: List all echelons
export async function GET() {
  try {
    const echelons = await prisma.echelon.findMany();
    log.info('Echelons data fetched successfully:', echelons);
    return NextResponse.json(echelons);
  } catch (error) {
    log.error('Failed to fetch echelons:', error);
    return NextResponse.json({ error: 'Failed to fetch echelons' }, { status: 500 });
  }
}

// POST: Create a new echelon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { minAge, maxAge, name, description, gender } = body;

    if (!minAge || !maxAge || !name || !gender) {
      log.error('Validation failed for creating echelon');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const payload = {
      data: { minAge: parseInt(minAge, 10), maxAge: parseInt(maxAge, 10), name, description, gender },
    };
    log.debug(payload)
    const echelon = await prisma.echelon.create(payload);

    log.info('Echelon created successfully:', echelon);
    return NextResponse.json(echelon, { status: 201 });
  } catch (error) {
    log.error('Failed to create echelon:', error);
    return NextResponse.json({ error: 'Failed to create echelon' }, { status: 500 });
  }
}
