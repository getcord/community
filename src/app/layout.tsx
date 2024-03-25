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
import {
  getCustomerInfo,
  getCustomerInfoById,
} from '@/app/helpers/customerInfo';

async function createCordEntitiesAsNeeded(sessionUser: Claims) {
  // Not sure why but sub seems to be the spot that the put the user_id
  const userID = sessionUser.sub;

  // Verify that we have the user and create if not
  try {
    await fetchCordRESTApi<ServerGetUser>(`users/${userID}`);
  } catch (error) {
    // Let's create the user and add them to the default community group
    await fetchCordRESTApi(`users/${userID}`, 'PUT', {
      name: sessionUser.name,
      email: sessionUser.email,
      profilePictureURL: sessionUser.picture,
      addGroups: ['community_all'],
    });
  }

  // Now check customer info as well
  const customerInfo = await getCustomerInfoById(userID);
  if (customerInfo.customerID) {
    // Verify that we have a customer and create if not
    try {
      await fetchCordRESTApi(`groups/${customerInfo.customerID}`);
    } catch (error) {
      // Create group as it does not exist
      await fetchCordRESTApi(`groups/${customerInfo.customerID}`, 'PUT', {
        name: customerInfo.customerName,
      });
    }

    // Now lets make sure the user is part of the group
    await fetchCordRESTApi(
      `groups/${customerInfo.customerID}/members`,
      'POST',
      {
        add: [userID],
      },
    );
  }
  return userID;
}

async function getData() {
  const { CORD_SECRET, CORD_APP_ID, CORD_CUSTOMER_ID } = process.env;
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
  const userID = await createCordEntitiesAsNeeded(session.user);
  const clientAuthToken = getClientAuthToken(CORD_APP_ID, CORD_SECRET, {
    user_id: userID,
  });
  const { customerID, customerName, supportEnabled } = await getCustomerInfo();

  return {
    clientAuthToken,
    categories,
    supportEnabled,
    supportChats:
       customerID !== CORD_CUSTOMER_ID
        ? [{ customerID, customerName: 'Cord' }]
        : // if it's not the CORD_APP_ID then it needs to be the array of all support chats
          [{ customerID, customerName }],
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
  const { clientAuthToken, categories, supportChats, supportEnabled } =
    await getData();
  const user = await getUser();

  return (
    <html lang="en">
      <body>
        <CordIntegration clientAuthToken={clientAuthToken}>
          <Header user={user} />
          <div className={styles.outlet}>
            <Sidebar
              categories={categories}
              supportChats={supportChats}
              supportEnabled={supportEnabled}
            />
            <div className={styles.content}>{children}</div>
          </div>
        </CordIntegration>
      </body>
    </html>
  );
}
