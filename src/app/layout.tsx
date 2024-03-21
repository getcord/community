import type { Metadata } from 'next';
import './global.css';
import { getClientAuthToken } from '@cord-sdk/server';
import CordIntegration from './CordIntegration';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import styles from './styles.module.css';
import { CATEGORIES } from '@/app/types';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import type { ServerGetUser } from '@cord-sdk/types';
import { Claims, getSession } from '@auth0/nextjs-auth0';
import { getUser } from '@/app/helpers/user';

async function createUserIfNecessary(sessionUser: Claims) {
  const name = sessionUser.name;
  const email = sessionUser.email;
  // Not sure why but sub seems to be the spot that the put the user_id
  const userID = sessionUser.sub;
  const profilePictureURL = sessionUser.picture;

  try {
    await fetchCordRESTApi<ServerGetUser>(`users/${userID}`);
  } catch (error) {
    // Let's create the user and add them to the default community group
    await fetchCordRESTApi(`users/${userID}`, 'PUT', {
      name,
      email,
      profilePictureURL,
      addGroups: ['community_all'],
    });
  }
  return userID;
}

async function getData() {
  const { CORD_SECRET, CORD_APP_ID } = process.env;
  const categories = [...CATEGORIES];
  if (!CORD_SECRET || !CORD_APP_ID) {
    console.error(
      'Missing CORD_SECRET or CORD_APP_ID env variable. Get it on console.cord.com and add it to .env',
    );
    return { clientAuthToken: null, categories };
  }
  const session = await getSession();
  if (!session) {
    return { clientAuthToken: null, categories };
  }
  const userID = await createUserIfNecessary(session.user);
  const clientAuthToken = getClientAuthToken(CORD_APP_ID, CORD_SECRET, {
    user_id: userID,
  });

  return {
    clientAuthToken,
    categories,
  };
}

export const metadata: Metadata = {
  title: 'Cord Community',
  description: 'Hub for Cord users to connect',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { clientAuthToken, categories } = await getData();
  const user = await getUser();

  return (
    <html lang="en">
      <body>
        <CordIntegration clientAuthToken={clientAuthToken}>
          <Header user={user} />
          <div className={styles.outlet}>
            <Sidebar categories={categories} />
            <div className={styles.content}>{children}</div>
          </div>
        </CordIntegration>
      </body>
    </html>
  );
}
