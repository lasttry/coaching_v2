import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const data = await request.json();

    const newOpponent = await prisma.opponent.create({
      data: {
        name: data.name,
        shortName: data.shortName,
        image: data.image ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        venues: {
          create: (data.venues || []).map((venue: { name: string }) => ({
            name: venue.name,
          })),
        },
      },
      include: {
        venues: true,
      },
    });

    return NextResponse.json(newOpponent, { status: 201 });
  } catch (error) {
    console.error('Error creating opponent:', error);
    return NextResponse.json({ error: 'Error creating opponent' }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const opponents = await prisma.opponent.findMany({
      include: {
        venues: true,
      },
    });

    return NextResponse.json(opponents);
  } catch (error) {
    console.error('Error fetching opponents:', error);
    return NextResponse.json({ error: 'Error fetching opponents' }, { status: 500 });
  }
}
