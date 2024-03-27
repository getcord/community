import type { Metadata } from 'next';
import './global.css';
import { getClientAuthToken } from '@cord-sdk/server';
import CordIntegration from './CordIntegration';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import styles from './styles.module.css';
import { CATEGORIES } from '@/app/types';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { Claims, getSession } from '@auth0/nextjs-auth0';
import { User, getUserById } from '@/app/helpers/user';
import { getCustomerInfoForUserId } from '@/app/helpers/customerInfo';
import { ServerGroupData } from '@cord-sdk/types';

async function createCordEntitiesAsNeeded(sessionUser: Claims) {
  // Not sure why but sub seems to be the spot that the put the user_id
  const userID = sessionUser.sub as string;

  const [user, customerInfo] = await Promise.all([
    getUserById(userID),
    getCustomerInfoForUserId(userID),
  ]);

  if (!user.userID) {
    // If we don't have a user, let's create them while we have the
    // session info and add them to the default community group
    await fetchCordRESTApi(`users/${userID}`, 'PUT', {
      name: sessionUser.name,
      email: sessionUser.email,
      profilePictureURL: sessionUser.picture,
      addGroups: ['community_all'],
    });
  }

  // Now check customer info as well
  if (customerInfo.customerID) {
    // Verify that we have a customer and create if not
    const cordUser = await fetchCordRESTApi(
      `groups/${customerInfo.customerID}`,
    );
    if (!cordUser) {
      // Create group as it does not exist
      const customerGroup = await fetchCordRESTApi<ServerGroupData | undefined>(
        `groups/${customerInfo.customerID}`,
      );

      // Create group if it doesn't exist, but if it does then update the metadata to reflect
      // the actual status in case it's not synced (eg customer downgraded or upgraded)
      if (
        !customerGroup ||
        customerGroup.metadata?.['supportEnabled'] !==
          customerInfo.supportEnabled
      ) {
        await fetchCordRESTApi(`groups/${customerInfo.customerID}`, 'PUT', {
          name: customerInfo.customerName,
          metadata: { supportEnabled: customerInfo.supportEnabled },
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
  }
  return userID;
}

async function getSupportChats({ userID, isAdmin, groups: usersGroups }: User) {
  if (!userID) {
    return [];
  }
  const allGroups = await fetchCordRESTApi<ServerGroupData[]>(`groups`);

  if (!allGroups) {
    return [];
  }

  return allGroups
    .filter((group) => {
      // if you're an admin, you should see all groups where support is enabled
      // otherwise only view groups you're a part of
      if (isAdmin) {
        return !!group.metadata?.['supportEnabled'];
      }
      return (
        !!group.metadata?.['supportEnabled'] && usersGroups?.includes(group.id)
      );
    })
    .map((group) => ({ customerID: group.id, customerName: group.name }));
}

async function getData() {
  const { CORD_SECRET, CORD_APP_ID } = process.env;
  const categories = [...CATEGORIES];
  if (!CORD_SECRET || !CORD_APP_ID) {
    console.error(
      'Missing CORD_SECRET or CORD_APP_ID env variable. Get it on console.cord.com and add it to .env',
    );
    return { clientAuthToken: null, categories, user: {} as User };
  }
  const session = await getSession();
  if (!session) {
    return { clientAuthToken: null, categories, user: {} as User };
  }
  const userID = await createCordEntitiesAsNeeded(session.user);
  const clientAuthToken = getClientAuthToken(CORD_APP_ID, CORD_SECRET, {
    user_id: userID,
  });
  const [user, customerInfo] = await Promise.all([
    getUserById(userID),
    getCustomerInfoForUserId(userID),
  ]);
  const supportChats = await getSupportChats(user);
  const { supportEnabled } = customerInfo;

  return {
    clientAuthToken,
    categories,
    user,
    customerInfo,
    supportEnabled,
    supportChats,
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
  const {
    clientAuthToken,
    categories,
    user,
    supportChats,
    supportEnabled,
    customerInfo,
  } = await getData();

  return (
    <html lang="en">
      <head>
        {/* TODO: is this really how this should be done in NextJS? Report findings to Ludo */}
        {/* This may break when Alberto lands versioned css 👀 talk to him if it does! */}
        <link
          rel="stylesheet"
          id="cord_css"
          href="https://app.staging.cord.com/sdk/v1/sdk.latest.css"
        />
        <link
          rel="stylesheet"
          id="cord_react_css"
          href="https://app.staging.cord.com/sdk/css/cord-react.css"
        />
      </head>
      <body>
        <CordIntegration clientAuthToken={clientAuthToken}>
          <Header user={user} />
          <div className={styles.outlet}>
            <Sidebar
              categories={categories}
              supportChats={supportChats}
              supportEnabled={supportEnabled || user.isAdmin}
              isLoggedIn={!!user?.userID}
              customerExists={!!customerInfo?.customerID}
            />
            <div className={styles.content}>{children}</div>
          </div>
        </CordIntegration>
      </body>
    </html>
  );
}
