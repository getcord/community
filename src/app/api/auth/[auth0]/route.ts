import {
  HandlerError,
  getSession,
  handleAuth,
  handleLogin,
} from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const GET = handleAuth({
  'silent-login': async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);
    const returnTo = cookies().get('return-to')?.value;

    if (!session) {
      return handleLogin(req, res, {
        returnTo: returnTo,
        authorizationParams: {
          prompt: 'none',
        },
      });
    }
  },
  onError(_: NextRequest, __: HandlerError) {
    // we can't access the query params, so use a cookie to access the return to address
    const returnTo = cookies().get('return-to')?.value;
    cookies().set('retry-login', 'false');

    redirect(returnTo ?? '/');
  },
});
