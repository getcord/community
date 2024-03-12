"use client";

import Composer from "@/app/components/Composer";
import styles from "./chatDisplay.module.css";
import { EVERYONE_ORG_ID } from "@/consts";
import { Message, thread } from "@cord-sdk/react";

export default function ChatDisplay({ channelName }: { channelName: string }) {
  const { threads, loading } = thread.useThreads({
    filter: {
      location: {
        channel: channelName,
      },
    },
    sortDirection: "descending",
    initialFetchCount: 30,
  });

  return (
    <div className={styles.container}>
      <div className={styles.threads}>
        {!loading &&
          threads.length > 0 &&
          threads.map((thread) => {
            return <Message key={thread.id} threadId={thread.id} />;
          })}
      </div>
      {/* pull this out into content & have a map of which channels have what kind of composer permissions? */}
      <Composer
        type="NO_PERMISSION"
        groupId={EVERYONE_ORG_ID}
        location={{ channel: "announcements" }}
        threadName={`#announcements`}
      />
    </div>
  );
}
