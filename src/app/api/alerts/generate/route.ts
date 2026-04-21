import { NextResponse } from 'next/server';
import { log } from '@/lib/logger';
import { generateAthleteBirthdayAlertsForAllClubs } from '@/lib/alerts/birthday-generator';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request): Promise<NextResponse> {
  const secret = process.env.CRON_SECRET;
  const provided =
    req.headers.get('x-cron-secret') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!secret) {
    log.error('[alerts/generate] CRON_SECRET is not set');
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await generateAthleteBirthdayAlertsForAllClubs();
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    log.error('Failed to generate alerts:', error);
    return NextResponse.json({ error: 'Failed to generate alerts' }, { status: 500 });
  }
}

// Allow GET for easier debugging/triggering via browser/cron providers that only support GET.
export async function GET(req: Request): Promise<NextResponse> {
  return POST(req);
}
