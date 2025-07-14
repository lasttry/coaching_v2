import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';

export async function POST(request: Request): Promise<NextResponse> {
  const { svg } = await request.json();

  try {
    const drill = await prisma.drill.create({
      data: { svg },
    });
    return NextResponse.json(drill);
  } catch (err) {
    log.error(err);
    return NextResponse.json({ error: 'Failed to save drill' }, { status: 500 });
  }
}
