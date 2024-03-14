import { CoreMessageData, CoreThreadData } from "@cord-sdk/types";
import { fetchCordRESTApi } from "../fetchCordRESTApi";
import TileInner from "./TileInner";
import { ComponentProps } from "react";

const getThreadData = async (threadID: string, thread: CoreThreadData) => {
  const messages = await fetchCordRESTApi<CoreMessageData[]>(
    `threads/${threadID}/messages`,
    "GET"
  );

  const serverThread: ComponentProps<typeof TileInner>['serverThread'] = {
    id: thread.id,
    firstMessage: messages[0],
    metadata: thread.metadata,
    total: thread.total,
    lastMessage: messages[messages.length-1],
    participants: thread.participants,
  }
  return serverThread;
};

export default async function Tile({
  threadID,
  thread,
}: {
  threadID: string;
  thread: CoreThreadData;
}) {
  const data = await getThreadData(threadID, thread);

  return <TileInner threadID={threadID} serverThread={data} />;
}
