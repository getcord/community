import styles from "./threadList.module.css";
import { ServerListThreads } from "@cord-sdk/types";
import Tile from "@/app/components/Tile";
import { buildQueryParams, fetchCordRESTApi } from "@/app/fetchCordRESTApi";

const getThreadsData = async (category: string) => {
  const queries = [{
    field: "filter",
    value: JSON.stringify({
      metadata: {
        category,
      },
    }),
  }];
  const queryParams = category !== 'all' ?  buildQueryParams(queries) : '';
  const { threads } = await fetchCordRESTApi<ServerListThreads>(
    `threads${queryParams}`,
    "GET"
  );
  return threads;
};

export default async function ThreadList({ category }: { category: string }) {
  const threads = await getThreadsData(category);

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
