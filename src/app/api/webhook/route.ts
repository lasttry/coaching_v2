import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import crypto from 'crypto';

// Replace this with your GitHub webhook secret
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'your-secret';

const verifySignature = (req: NextRequest): boolean => {
  const signature = req.headers.get('x-hub-signature-256') || '';
  const hash = `sha256=${crypto.createHmac('sha256', SECRET).update(JSON.stringify(req.body)).digest('hex')}`;
  return signature === hash;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!verifySignature(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  exec(
    'cd /var/www/coaching && git pull && npm install && npx prisma migrate deploy && pm2 restart coaching',
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return NextResponse.json({ error: stderr }, { status: 500 });
      }
      return NextResponse.json({ message: 'Updated successfully' }, { status: 200 });
    }
  );

  return NextResponse.json({ message: 'Update triggered successfully' });
}
