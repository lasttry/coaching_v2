import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const { svg } = await request.json();

  try {
    const drill = await prisma.drill.create({
      data: { svg },
    });
    return NextResponse.json(drill);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: 'Failed to save drill' }, { status: 500 });
  }
}
