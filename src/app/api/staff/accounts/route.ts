import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import type { AvailableAccount } from '@/types/staff/types';

/**
 * Returns accounts that belong to the currently selected club, together with
 * information about whether they are already linked to another staff record
 * in that club. Intended to populate the "linked account" picker on the staff form.
 */
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.selectedClubId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clubId = session.user.selectedClubId;

  try {
    const accountClubs = await prisma.accountClub.findMany({
      where: { clubId },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const accountIds = accountClubs.map((ac) => ac.accountId);

    const linkedStaff = await prisma.staff.findMany({
      where: {
        clubId,
        accountId: { in: accountIds },
      },
      select: {
        id: true,
        name: true,
        accountId: true,
      },
    });

    const staffByAccount = new Map<number, { id: number; name: string }>();
    for (const s of linkedStaff) {
      if (s.accountId !== null) {
        staffByAccount.set(s.accountId, { id: s.id, name: s.name });
      }
    }

    const items: AvailableAccount[] = accountClubs
      .map((ac) => {
        const linked = staffByAccount.get(ac.accountId) || null;
        return {
          id: ac.account.id,
          name: ac.account.name,
          email: ac.account.email,
          linkedStaffId: linked ? linked.id : null,
          linkedStaffName: linked ? linked.name : null,
        };
      })
      .sort((a, b) => {
        const aKey = (a.name || a.email).toLowerCase();
        const bKey = (b.name || b.email).toLowerCase();
        return aKey.localeCompare(bKey);
      });

    return NextResponse.json(items);
  } catch (error) {
    log.error('Error fetching accounts for staff form:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}
