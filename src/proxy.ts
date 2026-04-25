import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

const CHOOSE_CLUB_PATH = '/utilities/chooseClub';

// Paths a user without a selected club is still allowed to reach.
const EXEMPT_PREFIXES = [
  '/auth/',
  '/api/',
  '/utilities/profile',
  '/utilities/admin',
  CHOOSE_CLUB_PATH,
];

function isExempt(pathname: string): boolean {
  return EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { selectedClubId?: number | null } | undefined;

  if (!user) {
    return NextResponse.next();
  }

  if (isExempt(pathname)) {
    return NextResponse.next();
  }

  const selectedClubId = user.selectedClubId;
  if (selectedClubId === null || selectedClubId === undefined) {
    const url = req.nextUrl.clone();
    url.pathname = CHOOSE_CLUB_PATH;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/forgot-password|auth/reset-password).*)',
  ],
};
