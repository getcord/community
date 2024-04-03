import styles from './threadList.module.css';
import { ServerListThreads } from '@cord-sdk/types';
import Tile from '@/app/components/Tile';
import { buildQueryParams, fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { Category } from '@/app/types';

const getThreadsData = async (category: Category | undefined) => {
  const getFilter = (category: Category | undefined, pinned: boolean) => [
    {
      field: 'filter',
      value: JSON.stringify({
        metadata: {
          pinned,
          ...(category && { [category]: true }),
        },
      }),
    },
  ];
  const categoryQueryParams = buildQueryParams(getFilter(category, false));
  const pinnedQueryParams = buildQueryParams(getFilter(category, true));
  const [pinnedResults, categoryResults] = await Promise.all([
    fetchCordRESTApi<ServerListThreads>(`threads${pinnedQueryParams}`, 'GET'),
    fetchCordRESTApi<ServerListThreads>(`threads${categoryQueryParams}`, 'GET'),
  ]);

  return {
    threads: [
      ...(pinnedResults?.threads ?? []),
      ...(categoryResults?.threads ?? []),
    ],
    total:
      (pinnedResults?.pagination.total ?? 0) +
      (categoryResults?.pagination.total ?? 0),
  };
};

export default async function ThreadList({
  category,
}: {
  category?: Category;
}) {
  // do we want this to update? Probably? In that case we need to useThreads as well
  const { threads, total } = await getThreadsData(category);

  if (threads.length < 1 && total === 0) {
    // flickering -> to be fixed
    return <p>No posts yet!</p>;
  }

  return (
    <table className={styles.container}>
      <thead className={styles.tableHeader}>
        <tr>
          <th>Post</th>
          <th>Replies</th>
          <th>Activity</th>
        </tr>
      </thead>
      <tbody className={styles.table}>
        {threads?.length > 0 &&
          threads.map((thread) => {
            return (
              <Tile key={thread.id} threadID={thread.id} thread={thread} />
            );
          })}
      </tbody>
    </table>
  );
}
