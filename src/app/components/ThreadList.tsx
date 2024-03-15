import styles from './threadList.module.css';
import { ServerListThreads } from '@cord-sdk/types';
import Tile from '@/app/components/Tile';
import { buildQueryParams, fetchCordRESTApi } from '@/app/fetchCordRESTApi';

const getThreadsData = async (category: string) => {
  const categoryFilter = [
    {
      field: 'filter',
      value: JSON.stringify({
        metadata: {
          pinned: false,
          category,
        },
      }),
    },
  ];
  const pinnedFilter = [
    {
      field: 'filter',
      value: JSON.stringify({
        metadata: {
          pinned: true,
        },
      }),
    },
  ];
  const categoryQueryParams =
    category !== 'all' ? buildQueryParams(categoryFilter) : '';
  const pinnedQueryParams = buildQueryParams(pinnedFilter);
  const pinnedResults = await fetchCordRESTApi<ServerListThreads>(
    `threads${pinnedQueryParams}`,
    'GET',
  );
  const categoryResults = await fetchCordRESTApi<ServerListThreads>(
    `threads${categoryQueryParams}`,
    'GET',
  );
  return {
    threads: [...pinnedResults.threads, ...categoryResults.threads],
    total: pinnedResults.pagination.total + categoryResults.pagination.total,
  };
};

export default async function ThreadList({ category }: { category: string }) {
  // do we want this to update? Probably? In that case we need to useThreads as well
  const { threads, total } = await getThreadsData(category);

  if (threads.length < 1 && total === 0) {
    // flickering -> to be fixed
    return <p>No posts yet!</p>;
  }

  return (
    <table className={styles.container}>
      <tbody className={styles.table}>
        <tr>
          <th>Post</th>
          <th>Participants</th>
          <th>Replies</th>
          <th>Activity</th>
        </tr>
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
