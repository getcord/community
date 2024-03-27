'use client';

import { Thread, thread as threadHooks } from '@cord-sdk/react';
import styles from '../post.module.css';
import { getTypedMetadata } from '@/utils';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { PushPinSvg } from '@/app/components/PushPinSVG';
import { CategoryPills } from '@/app/components/CategoryPills';
import { Metadata } from '@/app/types';

export type ThreadData = {
  id: string;
  metadata: Metadata;
  name: string;
};

export default function Post({ threadID }: { threadID: string }) {
  const { thread, loading } = threadHooks.useThread(threadID);

  // check for undefined, and not loading
  if (!thread && !loading) {
    return <ThreadNotFound />;
  }

  const metadata = getTypedMetadata(thread?.metadata);

  return (
    <>
      <div className={styles.heading}>
        <span className={styles.icons}>
          {thread?.metadata.admin && (
            <LockClosedIcon width="24px" strokeWidth={3} />
          )}
          {thread?.metadata.pinned && (
            <PushPinSvg className={`${styles.pinIcon}`} />
          )}
        </span>
        <h1 className={styles.threadName}>{thread?.name}</h1>
      </div>
      <CategoryPills categories={metadata.categories} />
      <Thread threadId={threadID} />
    </>
  );
}

export function ThreadNotFound() {
  return <p>oops we couldn&apos;t find that post - sorry!</p>;
}
