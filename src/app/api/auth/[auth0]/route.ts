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
    if (!session) {
      return handleLogin(req, res, {
        authorizationParams: {
          prompt: 'none',
        },
      });
    }
  },
  onError(req: NextRequest, __: HandlerError) {
    const returnTo = req.cookies.get('return_to')?.value ?? '/';
    cookies().set('retry_login', 'false');

    redirect(returnTo);
  },
});
