'use client';
import { thread as threadHooks, betaV2 } from '@cord-sdk/react';
import {
  CoreMessageData,
  EntityMetadata,
  ThreadParticipant,
} from '@cord-sdk/types';
import {
  ChatBubbleOvalLeftEllipsisIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import styles from './tile.module.css';
import Link from 'next/link';
import { getPostMetadata, slugify } from '@/utils';
import { PushPinSvg } from './PushPinSVG';
import { CategoryPills } from '@/app/components/CategoryPills';
import { SolutionLabel } from '@/app/components/SolutionLabel';

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

  const metadata = getPostMetadata(thread.metadata);
  const showIcons = metadata.locked || metadata.pinned;
  const url = `/post/${threadID}/${slugify(thread.name)}`;
  return (
    <article className={styles.container}>
      <div className={styles.heading}>
        <div className={styles.headingTextWithCategoryPills}>
          <div className={styles.headingTextWithIcons}>
            {showIcons && (
              <span className={styles.icons}>
                {metadata.locked && (
                  <LockClosedIcon width="14px" strokeWidth={3} />
                )}
                {metadata.pinned && (
                  <PushPinSvg className={`${styles.pinIcon}`} />
                )}
              </span>
            )}
            <h3 className={styles.threadName}>
              <Link className={styles.link} href={url} aria-label={thread.name}>
                {thread.name}
              </Link>
            </h3>
            {metadata.answerMessageID && <SolutionLabel />}
          </div>
          <CategoryPills categories={metadata.categories} />
        </div>
        <div className={styles.timestamp}>
          {thread.total > 1 && (
            <a
              href={url}
              className={styles.replies}
              title={thread.total - 1 + ' replies'}
            >
              {thread.total - 1}
              <ChatBubbleOvalLeftEllipsisIcon width={14} strokeWidth={2} />
            </a>
          )}
          <betaV2.Timestamp
            type="message"
            className={styles.column}
            value={thread.lastMessage?.createdTimestamp}
          />
        </div>
      </div>
      <blockquote className={styles.messageSnippet}>
        {thread.firstMessage?.plaintext}
      </blockquote>
    </article>
  );
}
