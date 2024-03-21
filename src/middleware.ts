import { getSession } from '@auth0/nextjs-auth0/edge';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth handlers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const response = new NextResponse();
  const session = await getSession(request, response);

  const retryLogin = cookies().get('retry-login')?.value;
  const returnTo = request.nextUrl.pathname;

  if (!session?.user && retryLogin !== 'false') {
    const isCurrentPageNewPost = request.nextUrl.pathname === '/newpost';

    const loginUrl = new URL(
      `/api/auth/${isCurrentPageNewPost ? 'login' : 'silent-login'}`,
      request.url,
    );
    loginUrl.searchParams.append('returnTo', returnTo);
    response.cookies.delete('retry-login');

    const newResponse = NextResponse.redirect(loginUrl);
    newResponse.cookies.set('return-to', returnTo);

    return newResponse;
  }

  response.cookies.delete('retry-login');
  response.cookies.delete('return-to');

  return NextResponse.next(response);
}
