import styles from './threadList.module.css';
import { ServerListThreads } from '@cord-sdk/types';
import Tile from '@/app/components/Tile';
import { buildQueryParams, fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { Category } from '@/app/types';

const getThreadsData = async (category: Category | undefined) => {
  // Fetch all threads for the 'community_all' group and then any in the
  // particular category if specified
  const filter = buildQueryParams([
    {
      field: 'filter',
      value: JSON.stringify({
        ...(category && { metadata: { [category]: true } }),
        groupID: 'community_all',
      }),
    },
  ]);

  const threadsData = await fetchCordRESTApi<ServerListThreads>(
    `threads${filter}`,
    'GET',
  );
  const pinnedResults = threadsData?.threads
    ? threadsData.threads.filter((thread) => {
        return thread.metadata.pinned ?? false;
      })
    : [];
  const categoryResults = threadsData?.threads
    ? threadsData.threads.filter((thread) => {
        return !thread.metadata.pinned;
      })
    : [];

  return {
    threads: [...pinnedResults, ...categoryResults],
  };
};

export default async function ThreadList({
  category,
}: {
  category?: Category;
}) {
  // do we want this to update? Probably? In that case we need to useThreads as well
  const { threads } = await getThreadsData(category);

  if (threads.length < 1) {
    // flickering -> to be fixed
    return <p>No posts yet!</p>;
  }

  return (
    <section className={styles.container}>
      {threads?.length > 0 &&
        threads.map((thread) => {
          return <Tile key={thread.id} threadID={thread.id} thread={thread} />;
        })}
    </section>
  );
}
