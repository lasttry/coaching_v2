import nodemailer, { Transporter } from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import { decryptSecret } from './crypto';

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export interface SendEmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
}

/**
 * Loads SMTP settings for a club and returns a ready-to-use nodemailer transport.
 * Throws a descriptive error if settings are missing/incomplete or disabled.
 */
async function buildTransportForClub(
  clubId: number
): Promise<{ transport: Transporter; from: string; replyTo?: string }> {
  const settings = await prisma.clubEmailSettings.findUnique({
    where: { clubId },
  });

  if (!settings) {
    throw new Error('Email settings not configured for this club');
  }
  if (!settings.enabled) {
    throw new Error('Email sending is disabled for this club');
  }
  if (!settings.host || !settings.port || !settings.fromEmail) {
    throw new Error('Email settings are incomplete (host/port/fromEmail required)');
  }

  let pass: string | undefined;
  if (settings.passEncrypted) {
    try {
      pass = decryptSecret(settings.passEncrypted);
    } catch (err) {
      log.error('Failed to decrypt SMTP password:', err);
      throw new Error('Failed to decrypt SMTP password');
    }
  }

  const transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth:
      settings.user && pass
        ? {
            user: settings.user,
            pass,
          }
        : undefined,
  });

  const from = settings.fromName
    ? `"${settings.fromName}" <${settings.fromEmail}>`
    : settings.fromEmail;

  return {
    transport,
    from,
    replyTo: settings.replyTo || undefined,
  };
}

/**
 * Sends an email using the SMTP settings configured for the given club.
 * Returns nodemailer's basic delivery info. Throws on any send failure.
 */
export async function sendEmailForClub(
  clubId: number,
  input: SendEmailInput
): Promise<SendEmailResult> {
  const { transport, from, replyTo } = await buildTransportForClub(clubId);

  const info = await transport.sendMail({
    from,
    replyTo,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return {
    messageId: info.messageId,
    accepted: (info.accepted as string[]) ?? [],
    rejected: (info.rejected as string[]) ?? [],
  };
}

/**
 * Verifies the SMTP connection for a club (without sending a message).
 * Useful for a "test connection" button on the settings page.
 */
export async function verifyClubEmailConnection(clubId: number): Promise<true> {
  const { transport } = await buildTransportForClub(clubId);
  await transport.verify();
  return true;
}
