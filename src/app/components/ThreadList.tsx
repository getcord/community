import styles from "./threadList.module.css";
import { ServerListThreads } from "@cord-sdk/types";
import Tile from "@/app/components/Tile";
import { buildQueryParams, fetchCordRESTApi } from "@/app/fetchCordRESTApi";

const getThreadsData = async (category: string) => {
  const queries = [
    {
      field: "filter",
      value: JSON.stringify({
        metadata: {
          category,
        },
      }),
    },
  ];
  const queryParams = category !== "all" ? buildQueryParams(queries) : "";
  const result = await fetchCordRESTApi<ServerListThreads>(
    `threads${queryParams}`,
    "GET"
  );
  return result;
};

// TODO: put pinned threads to the top

export default async function ThreadList({ category }: { category: string }) {
  // do we want this to update? Probably? In that case we need to useThreads as well
  const { threads, pagination } = await getThreadsData(category);

  if (threads.length < 1 && pagination.total === 0) {
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
