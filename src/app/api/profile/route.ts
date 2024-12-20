import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

const MIN_PASSWORD_LENGTH = 8;

function generateSalt(length = 16): string {
  return crypto.randomBytes(length).toString('hex');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const passwordData = new TextEncoder().encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse the form data
    const formData = await req.json();
    const name = formData.name as string;
    const password = formData.password as string | null;
    const profilePhoto = formData.image as string | null;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be valid.' },
        { status: 400 },
      );
    }

    const updates: { name: string; password?: string; image?: string } = {
      name: name.trim(),
    };

    // Validate and hash password if provided
    if (password && password.trim().length > 0) {
      if (password.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
          {
            error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
          },
          { status: 400 },
        );
      }

      const salt = generateSalt();
      const hashedPassword = await hashPassword(password.trim(), salt);
      updates.password = `${salt}:${hashedPassword}`;
    }

    // Convert profile photo to Base64 and save it in the database
    if (profilePhoto) {
      updates.image = formData.image;
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: updates,
    });

    return NextResponse.json({
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    );
  }
}
