import type { Metadata } from 'next';
import './global.css';
import { getClientAuthToken } from '@cord-sdk/server';
import CordIntegration from './CordIntegration';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import styles from './styles.module.css';
import { Category } from '@/app/types';
import { SERVER_HOST } from '@/consts';
import { getSession } from '@auth0/nextjs-auth0';

async function getData() {
  const { CORD_SECRET, CORD_APP_ID } = process.env;
  const session = await getSession();

  if (!CORD_SECRET || !CORD_APP_ID) {
    console.error(
      'Missing CORD_SECRET or CORD_APP_ID env variable. Get it on console.cord.com and add it to .env',
    );
    return { clientAuthToken: null };
  }
  const clientAuthToken = getClientAuthToken(CORD_APP_ID, CORD_SECRET, {
    user_id: 'khadija',
  });
  const categoriesResponse = await fetch(`${SERVER_HOST}/api/categories`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  let categories: Category[];
  if (categoriesResponse.status !== 200) {
    categories = [];
  } else {
    categories = (await categoriesResponse.json()).data;
  }

  return {
    clientAuthToken,
    categories,
    user: session?.user,
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
  const { clientAuthToken, categories, user } = await getData();

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
