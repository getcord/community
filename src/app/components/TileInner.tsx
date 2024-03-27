'use client';
import { thread as threadHooks, experimental, Avatar } from '@cord-sdk/react';
import {
  CoreMessageData,
  EntityMetadata,
  ThreadParticipant,
} from '@cord-sdk/types';
import cx from 'classnames';
import {
  ChatBubbleBottomCenterIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import styles from './tile.module.css';
import Link from 'next/link';
import { getTypedMetadata, slugify } from '@/utils';
import { PushPinSvg } from './PushPinSVG';
import { CategoryPills } from '@/app/components/CategoryPills';

type ServerThread = {
  id: string;
  firstMessage: CoreMessageData;
  metadata: EntityMetadata;
  total: number;
  lastMessage: CoreMessageData;
  participants: ThreadParticipant[];
  name: string;
};

/*
 Avatar & timestamp are not able to be SSR, Adam's translation fix should sort that out 🤞
 */

export default function TileInner({
  threadID,
  serverThread,
}: {
  threadID: string;
  serverThread?: ServerThread;
}) {
  const data = threadHooks.useThread(threadID);
  const thread = data.thread ?? serverThread;
  if (!thread) {
    return;
  }

  const metadata = getTypedMetadata(thread.metadata);
  const showIcons = metadata.admin || metadata.pinned;

  return (
    <tr className={styles.container}>
      <td>
        <Link
          className={cx(styles.heading, styles.link)}
          href={`/post/${threadID}/${slugify(thread.name)}`}
          aria-label={thread.name}
        >
          {showIcons && (
            <span className={styles.icons}>
              {metadata.admin && (
                <LockClosedIcon width="14px" strokeWidth={3} />
              )}
              {metadata.pinned && (
                <PushPinSvg className={`${styles.pinIcon}`} />
              )}
            </span>
          )}
          <h3 className={styles.threadName}>{thread.name}</h3>
        </Link>
        <CategoryPills categories={metadata.categories} />
        <p className={`${styles.messageSnippet}`}>
          {thread.firstMessage?.plaintext}
        </p>
      </td>
      <td>
        <p className={`${styles.replies} ${styles.column}`}>
          {thread.total - 1}
          <ChatBubbleOvalLeftEllipsisIcon width={14} strokeWidth={2} />
        </p>
      </td>
      <td>
        <experimental.Timestamp
          type="message"
          className={styles.column}
          value={
            thread.lastMessage?.updatedTimestamp ??
            thread.lastMessage?.createdTimestamp
          }
        />
      </td>
    </tr>
  );
}
