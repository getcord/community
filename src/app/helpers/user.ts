import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import type { ServerGetUser } from '@cord-sdk/types';
import { getSession } from '@auth0/nextjs-auth0';
import { ADMINS_GROUP_ID } from '@/consts';

export type User = {
  userID?: string;
  name?: string;
  email?: string;
  profilePictureURL?: string;
  isAdmin?: boolean;
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
    const isAdmin = user.groups.includes(ADMINS_GROUP_ID);

    return {
      userID,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      profilePictureURL: user.profilePictureURL ?? undefined,
      isAdmin,
    };
  } catch (error) {
    return {};
  }
}
