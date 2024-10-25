import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import crypto from 'crypto';

// Replace this with your GitHub webhook secret
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'your-secret';

const verifySignature = (req: NextApiRequest) => {
  const signature = req.headers['x-hub-signature-256'] as string;
  const hash = `sha256=${crypto.createHmac('sha256', SECRET).update(JSON.stringify(req.body)).digest('hex')}`;
  return signature === hash;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' || !verifySignature(req)) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  exec('cd /var/www/coaching && git pull && npm install && npx prisma migrate deploy && pm2 restart coaching', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: stderr });
    }
    console.log(`Stdout: ${stdout}`);
    return res.status(200).json({ message: 'Updated successfully' });
  });
}
