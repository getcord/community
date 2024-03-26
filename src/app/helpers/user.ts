import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import type { ServerGetUser } from '@cord-sdk/types';
import { getSession } from '@auth0/nextjs-auth0';

export type User = {
  userID?: string;
  name?: string;
  email?: string;
  profilePictureURL?: string;
};

export async function getUser(): Promise<User> {
  const session = await getSession();
  if (!session || !session.user) {
    return {};
  }
  return getUserById(session.user.sub);
}

export async function getUserById(userID: string): Promise<User> {
  try {
    const user = await fetchCordRESTApi<ServerGetUser>(`users/${userID}`);
    return {
      userID,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      profilePictureURL: user.profilePictureURL ?? undefined,
    };
  } catch (error) {
    return {};
  }
}
