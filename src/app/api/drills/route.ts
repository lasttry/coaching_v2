import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { svg } = await request.json();

  try {
    const drill = await prisma.drill.create({
      data: { svg },
    });
    return NextResponse.json(drill);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save drill' }, { status: 500 });
  }
}
