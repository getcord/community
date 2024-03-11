"use client"

import Composer from "@/app/components/Composer";
import styles from "./conduct.module.css";
import { EVERYONE_ORG_ID } from "@/consts";
import { Message, thread } from "@cord-sdk/react";

export default function Conduct() {
  const {threads, loading} = thread.useThreads({
    filter: {
      location: {
        channel: "code-of-conduct",
      }
    },
    sortDirection: "descending"
  });
  return (
    <div className={styles.container}>
      <div className={styles.threads}>
      {!loading && threads.length > 0 && threads.map(thread => {
        return <Message
        key={thread.id}
        threadId={thread.id}
        />
      })}
      </div>
      {/* pull this out into content & have a map of which channels have what kind of composer permissions? */}
      <Composer
        type="NO_PERMISSION"
        groupId={EVERYONE_ORG_ID}
        location={{ channel: "code-of-conduct" }}
        threadName={`#"code-of-conduct"`}
      />
    </div>
  );
}

