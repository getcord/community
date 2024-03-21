import styles from './chatDisplay.module.css';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import ThreadsHeader from '@/app/components/ThreadsHeader';
import type { ServerUserData, ServerGetUser } from '@cord-sdk/types';
import ThreadList from '@/app/components/ThreadList';
import { Category } from '@/app/types';
import { getUser } from '@/app/helpers/user';

async function getAllCategoriesPermissions() {
  const { userID } = await getUser();
  if (!userID) {
    return;
  }

  try {
    // Fetch all groups the current user is in
    const { groups } = await fetchCordRESTApi<ServerGetUser>(`users/${userID}`);

    const mostCategories = (
      await fetchCordRESTApi<ServerUserData>('users/all_categories_holder')
    ).metadata as Record<string, string>;

    // returns all categories, with their permissions
    return Object.entries(mostCategories)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((acc, [key, value]) => {
        if (groups.includes(value)) {
          acc[key as Category] = { permission: 'READ_WRITE', group: value };
        } else {
          acc[key as Category] = { permission: 'READ', group: value };
        }
        return acc;
      }, {} as Record<Category, { permission: string; group: string }>);
  } catch (error) {
    console.error(error);
  }
}

export default async function ChatDisplay({
  channelName,
}: {
  channelName: Category;
}) {
  const allPermissions = await getAllCategoriesPermissions();
  const permissions =
    allPermissions && allPermissions[channelName]
      ? allPermissions[channelName]?.permission
      : 'NOT_VISIBLE';
  return (
    <div className={styles.container}>
      <ThreadsHeader permissions={permissions} category={channelName} />
      <ThreadList category={channelName} />
    </div>
  );
}
