import styles from "./threadList.module.css";
import { ServerListThreads } from "@cord-sdk/types";
import Tile from "@/app/components/Tile";
import { fetchCordRESTApi } from "@/app/fetchCordRESTApi";

const getThreadsData = async () => {
  const { threads } = await fetchCordRESTApi<ServerListThreads>(
    `threads`,
    "GET"
  );
  return threads;
};

export default async function ThreadList() {
  const threads = await getThreadsData();

  return (
    <table className={styles.container}>
      <tbody className={styles.table}>
        <thead>
          <tr>
            <th>Post</th>
            <th>Participants</th>
            <th>Replies</th>
            <th>Activity</th>
          </tr>
        </thead>
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
