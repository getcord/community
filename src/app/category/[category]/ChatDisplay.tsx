import styles from './chatDisplay.module.css';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import ThreadsHeader from '@/app/components/ThreadsHeader';
import { CORD_USER_COOKIE } from '@/consts';
import type { ServerUserData, ServerGetUser } from '@cord-sdk/types';
import { cookies } from 'next/headers';
import ThreadList from '@/app/components/ThreadList';

// TODO: move this into a permissions context
async function getAllCategoriesPermissions() {
  // TODO: update this to use logged in user id
  // change this to use myhoa or tom if you'd like to test admin users experience
  const user_id = 'khadija';

  try {
    // Fetch all groups the current user is in
    const { groups } = await fetchCordRESTApi<ServerGetUser>(
      `users/${user_id}`,
    );

    const mostCategories = (
      await fetchCordRESTApi<ServerUserData>('users/all_categories_holder')
    ).metadata as Record<string, string>;

    // returns all categories, with their permissions
    return Object.entries(mostCategories)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((acc, [key, value]) => {
        if (groups.includes(value)) {
          acc[key] = { permission: 'READ_WRITE', group: value };
        } else {
          acc[key] = { permission: 'READ', group: value };
        }
        return acc;
      }, {} as Record<string, { permission: string; group: string }>);
  } catch (error) {
    console.error(error);
  }
}

export default async function ChatDisplay({
  channelName,
}: {
  channelName: string;
}) {
  const userIdCookie = cookies().get(CORD_USER_COOKIE);
  async function getPermissionForChannel() {
    const categoryPermissions = await getAllCategoriesPermissions();
    if (
      !userIdCookie ||
      !categoryPermissions ||
      !categoryPermissions[channelName]
    ) {
      return 'NOT_VISIBLE';
    }
    return categoryPermissions[channelName].permission;
  }

  const permissions = await getPermissionForChannel();

  return (
    <div className={styles.container}>
      <ThreadsHeader permissions={permissions} />
      <ThreadList category={channelName} />
    </div>
  );
}
