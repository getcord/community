import type { Metadata } from 'next';
import { getClientAuthToken } from '@cord-sdk/server';
import { ServerGroupData } from '@cord-sdk/types';
import { ServerListGroup } from '@cord-sdk/types';
import { Analytics } from '@vercel/analytics/react';

import './global.css';
import CordIntegration from './CordIntegration';
import Header from './components/Header';
import styles from './styles.module.css';
import { CATEGORIES } from '@/app/types';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { Claims, getSession } from '@auth0/nextjs-auth0';
import { User, getUserById } from '@/app/helpers/user';
import {
  CustomerInfo,
  getCustomerInfoForUserId,
} from '@/app/helpers/customerInfo';
import { EVERYONE_GROUP_ID } from '@/consts';
import MainNav from '@/app/components/MainNav';

async function createCordEntitiesAsNeeded(sessionUser: Claims) {
  // Not sure why but sub seems to be the spot that the put the user_id
  const userID = sessionUser.sub as string;

  const [user, customerInfo] = await Promise.all([
    getUserById(userID),
    getCustomerInfoForUserId(userID),
  ]);

  // If we don't have a user, let's create them while we have the
  // session info and add them to the default community group
  if (!user.userID) {
    let name = sessionUser.name;
    // if their default name is their email address, then generate a different username
    // to make sure the user's email isn't used as the displayed name
    if (name === sessionUser.email) {
      const regex = /^(.*?)@/;
      // append random 5 - 10 digit number to everything before the @ symbol in their email address
      const nameFromEmail = regex.exec(sessionUser.name)?.[1] ?? '';
      const randomNumber = Math.floor(
        Math.random() * (999999999 - 10000) + 10000,
      );

      name = nameFromEmail + randomNumber;
    }

    await fetchCordRESTApi(`users/${userID}`, 'PUT', {
      name: name,
      email: sessionUser.email,
      profilePictureURL: sessionUser.picture,
      addGroups: [EVERYONE_GROUP_ID],
    });

    // Fill out the user object that was empty so that we can use it
    user['userID'] = userID;
    user['name'] = sessionUser.name;
    user['email'] = sessionUser.email;
    user['profilePictureURL'] = sessionUser.picture;
    user['isAdmin'] = false;
  }

  // Now check customer info as well
  if (customerInfo.customerID) {
    // Verify that we have a customer and create if not or if the customer
    // supportEnabled setting does not match
    const customerGroup = await fetchCordRESTApi<ServerGroupData>(
      `groups/${customerInfo.customerID}`,
    );

    if (
      !customerGroup ||
      customerGroup.metadata?.supportEnabled !== customerInfo.supportEnabled
    ) {
      await fetchCordRESTApi(`groups/${customerInfo.customerID}`, 'PUT', {
        name: customerInfo.customerName,
        metadata: { supportEnabled: customerInfo.supportEnabled },
      });
    }

    // Now lets make sure the user is part of the group
    if (
      customerGroup &&
      customerGroup.members &&
      !customerGroup.members.includes(userID)
    ) {
      await fetchCordRESTApi(
        `groups/${customerInfo.customerID}/members`,
        'POST',
        {
          add: [userID],
        },
      );
    }
  }

  return { user, customerInfo };
}

async function getSupportChats(user: User, customerInfo: CustomerInfo) {
  if (!user.isAdmin) {
    if (customerInfo.customerID) {
      return [{ customerID: customerInfo.customerID, customerName: 'Cord' }];
    }
    return [];
  }

  const allGroups = await fetchCordRESTApi<ServerListGroup[]>(`groups`);
  if (!allGroups) {
    return [];
  }

  return allGroups
    .filter((group) => group.metadata?.supportEnabled === true)
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
  const { user, customerInfo } = await createCordEntitiesAsNeeded(session.user);
  const clientAuthToken = getClientAuthToken(CORD_APP_ID, CORD_SECRET, {
    user_id: user.userID!,
  });
  const supportChats = await getSupportChats(user, customerInfo);
  return {
    clientAuthToken,
    categories,
    user,
    customerInfo,
    supportEnabled: customerInfo.supportEnabled || user.isAdmin,
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
          href="https://app.cord.com/sdk/v1/sdk.latest.css"
        />
        <link
          rel="stylesheet"
          id="cord_react_css"
          href="https://app.cord.com/sdk/css/cord-react.css"
        />
      </head>
      <body>
        <CordIntegration clientAuthToken={clientAuthToken}>
          <Header user={user} />
          <MainNav
            categories={categories}
            supportChats={supportChats}
            supportEnabled={supportEnabled}
            isLoggedIn={!!user?.userID}
            customerExists={!!customerInfo?.customerID}
          >
            <div className={styles.content}>{children}</div>
          </MainNav>
        </CordIntegration>
      </body>
      <script src="https://cord.com/events.js" async={true}></script>
    </html>
  );
}
