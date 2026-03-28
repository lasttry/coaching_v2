import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import crypto from 'crypto';
import { log } from '@/lib/logger';

const verifySignature = async (req: NextRequest, body: string): Promise<boolean> => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    log.error('GITHUB_WEBHOOK_SECRET is not configured');
    return false;
  }

  const signature = req.headers.get('x-hub-signature-256') || '';
  const hash = `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.text();

  const isValid = await verifySignature(req, body);
  if (!isValid) {
    log.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const deployPath = process.env.DEPLOY_PATH;
  if (!deployPath) {
    log.error('DEPLOY_PATH is not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  try {
    execSync('git pull && npm install && npx prisma migrate deploy && pm2 restart coaching', {
      cwd: deployPath,
      timeout: 120000,
      stdio: 'pipe',
    });

    log.info('Webhook deployment completed successfully');
    return NextResponse.json({ message: 'Update completed successfully' }, { status: 200 });
  } catch (error) {
    log.error('Webhook deployment failed:', error);
    return NextResponse.json({ error: 'Deployment failed' }, { status: 500 });
  }
}
