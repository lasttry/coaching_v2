import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/password';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    // Check if the email already exists
    const existingAccount = await prisma.account.findUnique({
      where: { email },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account with this email already exists' },
        { status: 409 }, // Conflict
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the new account
    const newAccount = await prisma.account.create({
      data: {
        name: name || null, // Allow nullable names
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || '';

  try {
    const accounts =
      email.length >= 3
        ? await prisma.account.findMany({
            where: {
              email: {
                contains: email,
                mode: 'insensitive', // Case-insensitive search
              },
            },
            select: {
              id: true,
              email: true,
              name: true,
              defaultClubId: true,
              clubs: true,
            },
          })
        : await prisma.account.findMany({
            select: {
              id: true,
              email: true,
              name: true,
              defaultClubId: true,
              clubs: true,
            },
          });

    return NextResponse.json(accounts, { status: 200 });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 },
    );
  }
}
