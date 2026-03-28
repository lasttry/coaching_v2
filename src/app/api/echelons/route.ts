import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { auth } from '@/lib/auth';

// GET: List all echelons
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const echelons = await prisma.echelon.findMany();
    return NextResponse.json(echelons);
  } catch (error) {
    log.error('Failed to fetch echelons:', error);
    return NextResponse.json({ error: 'Failed to fetch echelons' }, { status: 500 });
  }
}

// POST: Create a new echelon
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { minAge, maxAge, name, description, gender } = body;

    if (!minAge || !name || !gender) {
      log.error('Validation failed for creating echelon');
      return NextResponse.json(
        { error: `Validation failed for creating echelon.` },
        { status: 400 }
      );
    }
    const payload = {
      data: {
        minAge: parseInt(minAge, 10),
        maxAge: parseInt(maxAge, 10),
        name,
        description,
        gender,
      },
    };
    const echelon = await prisma.echelon.create(payload);

    return NextResponse.json(echelon, { status: 201 });
  } catch (error) {
    log.error('Failed to create echelon:', error);
    return NextResponse.json({ error: `Failed to create echelon.` }, { status: 500 });
  }
}
