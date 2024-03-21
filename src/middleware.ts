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

  const retryLogin = cookies().get('retry_login')?.value;
  const returnTo = request.nextUrl.pathname;

  if (!session?.user && retryLogin !== 'false') {
    const isCurrentPageNewPost = request.nextUrl.pathname === '/newpost';

    const loginUrl = new URL(
      `/api/auth/${isCurrentPageNewPost ? 'login' : 'silent-login'}`,
      request.url,
    );
    // passing the returnTo value as a query param will magically be passed
    // to auth0, and works out of the box
    loginUrl.searchParams.append('returnTo', returnTo);
    response.cookies.delete('retry_login');

    const newResponse = NextResponse.redirect(loginUrl);
    // We have to create this as a cookie, to access it in the handleAuth onError
    // callback, as that won't have access to the query param set above
    newResponse.cookies.set('return_to', returnTo);

    return newResponse;
  }

  response.cookies.delete('retry_login');
  response.cookies.delete('return_to');

  return NextResponse.next(response);
}
