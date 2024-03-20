import { getSession, handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

export const GET = handleAuth({
  'silent-login': async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession(req, res);

    if (!session) {
      try {
        return await handleLogin(req, res, {
          returnTo: '/',
          authorizationParams: {
            prompt: 'none',
          },
        });
      } catch (error) {
        console.error({ error });
        NextResponse.next();
      }
    }
  },
});
