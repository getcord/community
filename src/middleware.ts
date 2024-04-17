import { touchSession } from '@auth0/nextjs-auth0/edge';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (api handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const silentLogin = request.nextUrl.searchParams.get('silent_login');
  if (silentLogin === 'true') {
    const loginUrl = new URL('/api/auth/silent-login', request.url);
    // passing the returnTo value as a query param will magically be passed
    // to auth0, and works out of the box
    const returnTo = request.nextUrl.pathname;
    loginUrl.searchParams.append('returnTo', returnTo);
    return NextResponse.redirect(loginUrl);
  }
  // This is used to help refresh the session cookie
  await touchSession();
}
