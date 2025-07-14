import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request: Request): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { selectedClubId } = await request.json();
  session.user.selectedClubId = selectedClubId;

  // This value will be used in the `jwt` callback
  return NextResponse.json({
    message: 'Token update requested',
    update: { selectedClubId },
  });
}
