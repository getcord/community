"use client";
import { thread as threadHooks, Timestamp, Avatar } from "@cord-sdk/react";
import {
  CoreMessageData,
  EntityMetadata,
  ThreadParticipant,
} from "@cord-sdk/types";
import styles from "./tile.module.css";
import Link from "next/link";

type ServerThread = {
  id: string;
  firstMessage: CoreMessageData;
  metadata: EntityMetadata;
  total: number;
  lastMessage: CoreMessageData;
  participants: ThreadParticipant[];
};

/*
 Avatar & timestamp are not able to be SSR, Adam's translation fix should sort that out 🤞
 */

export default function TileInner({
  threadID,
  serverThread,
}: {
  threadID: string;
  serverThread: ServerThread;
}) {
  const data = threadHooks.useThread(threadID);
  const thread = data.thread ?? serverThread;

  return (
    <tr className={styles.container}>
      <td>
        <Link className={styles.link} href={`/post/${threadID}`} >
        {/* will update to thread name */}
        <h4 className={styles.threadName}>{thread.id}</h4>
        {/* only for pinned / locked? */}
        <p className={`${styles.messageSnippet}`}>
          {thread.firstMessage?.plaintext}
        </p>
        </Link>
      </td>
      <td>
        <div className={`${styles.participants} ${styles.column}`}>
          {thread.participants.map((participant) => (
            <Avatar
              key={participant.userID}
              userId={participant.userID ?? ""}
            />
          ))}
        </div>
      </td>
      <td>
        <p className={`${styles.replies} ${styles.column}`}>
          {thread.total - 1}
        </p>
      </td>
      <td>
        <Timestamp
          className={`${styles.activity} ${styles.column}`}
          value={
            thread.lastMessage?.updatedTimestamp ??
            thread.lastMessage?.createdTimestamp
          }
        />
      </td>
    </tr>
  );
}
