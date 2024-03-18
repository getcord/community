import type { Metadata } from 'next';
import './global.css';
import { getClientAuthToken } from '@cord-sdk/server';
import CordIntegration from './CordIntegration';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import styles from './styles.module.css';
import { Category } from '@/app/types';

async function getData() {
  const { CORD_SECRET, CORD_APP_ID } = process.env;
  if (!CORD_SECRET || !CORD_APP_ID) {
    console.error(
      'Missing CORD_SECRET or CORD_APP_ID env variable. Get it on console.cord.com and add it to .env',
    );
    return { clientAuthToken: null };
  }
  const clientAuthToken = getClientAuthToken(CORD_APP_ID, CORD_SECRET, {
    user_id: 'khadija',
  });
  const categoriesResponse = await fetch(`http:localhost:3000/api/categories`, {
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

  return (
    <html lang="en">
      <body>
        <CordIntegration clientAuthToken={clientAuthToken}>
          <div className={styles.dashboard}>
            <Sidebar categories={categories} />
            <Header />
            <div className={styles.content}>{children}</div>
          </div>
        </CordIntegration>
      </body>
    </html>
  );
}
