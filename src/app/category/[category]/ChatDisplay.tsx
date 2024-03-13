import styles from "./chatDisplay.module.css";
import { ServerListMessages } from "@cord-sdk/types";
import { fetchCordRESTApi } from "@/app/fetchCordRESTApi";
import CordMessage from "./CordMessage";

const getData = async () => {
  const messages = await fetchCordRESTApi<ServerListMessages["messages"]>(
    `threads/cord:e0b0d30d-926e-4b66-82b6-d6d7f8cc7809/messages`,
    "GET"
  );
  return messages;
};

export default async function ChatDisplay({
  channelName,
}: {
  channelName: string;
}) {
  const messages = await getData();

  return (
    <div className={styles.container}>
      <div className={styles.threads}>
        {messages?.length > 0 &&
          messages.map((message) => {
            return <CordMessage key={message.id} message={message} />;
          })}
      </div>
      {/* pull this out into content & have a map of which channels have what kind of composer permissions? */}
      {/* <Composer
        type="NO_PERMISSION"
        groupId={EVERYONE_GROUP_ID}
        location={{ channel: "announcements" }}
        threadName={`#announcements`}
      /> */}
    </div>
  );
}
