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

// When we fail a silent login the returnTo url is part of the error
// We can pull it directly off the error.  This type is basically to
// make typescript happy when we access it
type OpenIdError = Error & {
  openIdState: { returnTo: string };
};

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
  onError(_: NextRequest, error: HandlerError) {
    const returnTo =
      (error?.cause as OpenIdError)?.openIdState?.returnTo ?? '/';
    redirect(returnTo);
  },
});
