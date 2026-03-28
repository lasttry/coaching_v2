import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import crypto from 'crypto';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.account.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      log.info('Password reset requested for non-existent email');
      return NextResponse.json({ message: 'If the email exists, a reset link will be sent' });
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the token in the database
    await prisma.account.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Build the reset URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // TODO: Send email with reset link
    // For now, log it (in production, integrate with email service)
    log.info(`Password reset link for ${email}: ${resetUrl}`);

    // In development, return the link for testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        message: 'Reset link generated',
        resetUrl, // Only in development!
      });
    }

    return NextResponse.json({ message: 'If the email exists, a reset link will be sent' });
  } catch (error) {
    log.error('Error in forgot-password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
