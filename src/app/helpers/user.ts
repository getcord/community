import { Claims, getSession } from '@auth0/nextjs-auth0';

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
  return {
    userID: session.user.sub,
    name: session.user.name,
    email: session.user.email,
    profilePictureURL: session.user.picture,
  };
}
