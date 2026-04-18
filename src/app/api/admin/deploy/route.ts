import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { PlatformRole } from '@prisma/client';

const execAsync = promisify(exec);

interface DeployStep {
  name: string;
  command: string;
  timeout?: number;
  truncateOutput?: number;
}

const DEPLOY_STEPS: DeployStep[] = [
  { name: 'Reset Local Changes', command: 'git reset --hard HEAD' },
  { name: 'Git Pull', command: 'git pull --no-rebase origin main' },
  { name: 'NPM Install', command: 'npm install', timeout: 300000, truncateOutput: 1000 },
  { name: 'Prisma Generate', command: 'npx prisma generate' },
  { name: 'Prisma Migrate', command: 'npx prisma migrate deploy' },
  { name: 'Next Build', command: 'npx next build', timeout: 600000, truncateOutput: 1000 },
  { name: 'PM2 Restart', command: 'pm2 restart coaching' },
];

// SSE endpoint for real-time deploy updates
export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== PlatformRole.ADMIN) {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
  }

  const appDir = process.env.APP_DIR || '/var/www/coaching';

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: object) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const runStep = async (
        step: DeployStep,
        stepIndex: number
      ): Promise<{ success: boolean; output: string }> => {
        return new Promise((resolve) => {
          sendEvent('step_start', {
            stepIndex,
            stepName: step.name,
            totalSteps: DEPLOY_STEPS.length,
          });

          let output = '';
          let errorOutput = '';

          const child = spawn('sh', ['-c', `cd ${appDir} && ${step.command}`], {
            env: { ...process.env, FORCE_COLOR: '0' },
          });

          const timeout = step.timeout
            ? setTimeout(() => {
                child.kill('SIGTERM');
                sendEvent('step_error', {
                  stepIndex,
                  stepName: step.name,
                  error: 'Command timed out',
                });
                resolve({ success: false, output: 'Command timed out' });
              }, step.timeout)
            : null;

          child.stdout?.on('data', (data: Buffer) => {
            const text = data.toString();
            output += text;
            sendEvent('step_output', {
              stepIndex,
              stepName: step.name,
              output: text,
              stream: 'stdout',
            });
          });

          child.stderr?.on('data', (data: Buffer) => {
            const text = data.toString();
            errorOutput += text;
            sendEvent('step_output', {
              stepIndex,
              stepName: step.name,
              output: text,
              stream: 'stderr',
            });
          });

          child.on('close', (code) => {
            if (timeout) clearTimeout(timeout);

            const success = code === 0;
            const finalOutput = step.truncateOutput
              ? (output + errorOutput).slice(-step.truncateOutput)
              : output + errorOutput;

            sendEvent('step_complete', {
              stepIndex,
              stepName: step.name,
              success,
              exitCode: code,
              output: finalOutput,
            });

            resolve({ success, output: finalOutput });
          });

          child.on('error', (err) => {
            if (timeout) clearTimeout(timeout);
            sendEvent('step_error', {
              stepIndex,
              stepName: step.name,
              error: err.message,
            });
            resolve({ success: false, output: err.message });
          });
        });
      };

      sendEvent('deploy_start', {
        totalSteps: DEPLOY_STEPS.length,
        steps: DEPLOY_STEPS.map((s) => s.name),
      });

      const results: { step: string; success: boolean; output: string }[] = [];

      for (let i = 0; i < DEPLOY_STEPS.length; i++) {
        const step = DEPLOY_STEPS[i];
        const result = await runStep(step, i);
        results.push({ step: step.name, success: result.success, output: result.output });

        if (!result.success) {
          sendEvent('deploy_complete', {
            success: false,
            failedStep: step.name,
            results,
          });
          controller.close();
          return;
        }
      }

      sendEvent('deploy_complete', {
        success: true,
        message: 'Deploy completed successfully!',
        results,
      });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// GET endpoint to check deploy status / last commit
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== PlatformRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const appDir = process.env.APP_DIR || '/var/www/coaching';

    // Get current commit info
    const { stdout: commitInfo } = await execAsync(
      `cd ${appDir} && git log -1 --format='%H|%s|%an|%ar'`
    );
    const [hash, message, author, time] = commitInfo.trim().split('|');

    // Check for updates
    await execAsync(`cd ${appDir} && git fetch origin main`);
    const { stdout: behind } = await execAsync(
      `cd ${appDir} && git rev-list HEAD..origin/main --count`
    );
    const commitsBeind = parseInt(behind.trim(), 10);

    // Get PM2 status
    let pm2Status = 'unknown';
    try {
      const { stdout: pm2Info } = await execAsync(`pm2 jlist`);
      const processes = JSON.parse(pm2Info);
      const coaching = processes.find((p: { name: string }) => p.name === 'coaching');
      pm2Status = coaching?.pm2_env?.status || 'not found';
    } catch {
      pm2Status = 'error';
    }

    return NextResponse.json({
      currentCommit: {
        hash: hash?.slice(0, 7),
        message,
        author,
        time,
      },
      updateAvailable: commitsBeind > 0,
      commitsBehind: commitsBeind,
      pm2Status,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}
