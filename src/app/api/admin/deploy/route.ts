import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import { PlatformRole } from '@prisma/client';

const execAsync = promisify(exec);

// Only allow ADMIN users to deploy
export async function POST(): Promise<NextResponse> {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== PlatformRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const appDir = process.env.APP_DIR || '/var/www/coaching';
    const steps: { step: string; output: string; success: boolean }[] = [];

    // Step 1: Reset local changes (package-lock.json often differs between environments)
    try {
      const { stdout: resetOutput } = await execAsync(`cd ${appDir} && git reset --hard HEAD`);
      steps.push({ step: 'Reset Local Changes', output: resetOutput, success: true });
    } catch (error) {
      const err = error as { stderr?: string; message?: string };
      steps.push({
        step: 'Reset Local Changes',
        output: err.stderr || err.message || 'Unknown error',
        success: false,
      });
      return NextResponse.json(
        { success: false, steps, error: 'Git reset failed' },
        { status: 500 }
      );
    }

    // Step 2: Git pull (--no-rebase to avoid issues with local changes)
    try {
      const { stdout: gitOutput } = await execAsync(
        `cd ${appDir} && git pull --no-rebase origin main`
      );
      steps.push({ step: 'Git Pull', output: gitOutput, success: true });
    } catch (error) {
      const err = error as { stderr?: string; message?: string };
      steps.push({
        step: 'Git Pull',
        output: err.stderr || err.message || 'Unknown error',
        success: false,
      });
      return NextResponse.json(
        { success: false, steps, error: 'Git pull failed' },
        { status: 500 }
      );
    }

    // Step 2: npm install
    try {
      const { stdout: npmOutput } = await execAsync(
        `cd ${appDir} && npm install --legacy-peer-deps`,
        {
          timeout: 300000, // 5 minutes
        }
      );
      steps.push({ step: 'NPM Install', output: npmOutput.slice(-500), success: true });
    } catch (error) {
      const err = error as { stderr?: string; message?: string };
      steps.push({
        step: 'NPM Install',
        output: err.stderr || err.message || 'Unknown error',
        success: false,
      });
      return NextResponse.json(
        { success: false, steps, error: 'NPM install failed' },
        { status: 500 }
      );
    }

    // Step 3: Prisma generate
    try {
      const { stdout: prismaOutput } = await execAsync(`cd ${appDir} && npx prisma generate`);
      steps.push({ step: 'Prisma Generate', output: prismaOutput, success: true });
    } catch (error) {
      const err = error as { stderr?: string; message?: string };
      steps.push({
        step: 'Prisma Generate',
        output: err.stderr || err.message || 'Unknown error',
        success: false,
      });
      return NextResponse.json(
        { success: false, steps, error: 'Prisma generate failed' },
        { status: 500 }
      );
    }

    // Step 4: Prisma migrate
    try {
      const { stdout: migrateOutput } = await execAsync(
        `cd ${appDir} && npx prisma migrate deploy`
      );
      steps.push({ step: 'Prisma Migrate', output: migrateOutput, success: true });
    } catch (error) {
      const err = error as { stderr?: string; message?: string };
      steps.push({
        step: 'Prisma Migrate',
        output: err.stderr || err.message || 'Unknown error',
        success: false,
      });
      return NextResponse.json(
        { success: false, steps, error: 'Prisma migrate failed' },
        { status: 500 }
      );
    }

    // Step 5: Build
    try {
      const { stdout: buildOutput } = await execAsync(`cd ${appDir} && npx next build`, {
        timeout: 600000, // 10 minutes
      });
      steps.push({ step: 'Next Build', output: buildOutput.slice(-500), success: true });
    } catch (error) {
      const err = error as { stderr?: string; message?: string };
      steps.push({
        step: 'Next Build',
        output: err.stderr || err.message || 'Unknown error',
        success: false,
      });
      return NextResponse.json({ success: false, steps, error: 'Build failed' }, { status: 500 });
    }

    // Step 6: Restart PM2
    try {
      const { stdout: pm2Output } = await execAsync(`pm2 restart coaching`);
      steps.push({ step: 'PM2 Restart', output: pm2Output, success: true });
    } catch (error) {
      const err = error as { stderr?: string; message?: string };
      steps.push({
        step: 'PM2 Restart',
        output: err.stderr || err.message || 'Unknown error',
        success: false,
      });
      return NextResponse.json(
        { success: false, steps, error: 'PM2 restart failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      steps,
      message: 'Deploy completed successfully!',
    });
  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
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
