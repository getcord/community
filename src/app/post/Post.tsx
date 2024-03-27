'use client';

import { Thread, thread as threadHooks } from '@cord-sdk/react';
import styles from './post.module.css';
import { getTypedMetadata } from '@/utils';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { PushPinSvg } from '@/app/components/PushPinSVG';
import { CategoryPills } from '@/app/components/CategoryPills';
import { Metadata } from '@/app/types';
import { useEffect } from 'react';

export type ThreadData = {
  id: string;
  metadata: Metadata;
  name: string;
};

export default function Post({ threadID }: { threadID: string }) {
  const { thread, loading, hasMore, fetchMore } =
    threadHooks.useThread(threadID);

  useEffect(() => {
    if (hasMore) {
      void fetchMore(10);
    }
  }, [hasMore, fetchMore]);

  if (!thread && !loading) {
    return <ThreadNotFound />;
  }

  const metadata = getTypedMetadata(thread?.metadata);

  return (
    <>
      <ThreadHeading metadata={metadata} threadName={thread?.name || ''} />

      <Thread threadId={threadID} />
    </>
  );
}

export function ThreadNotFound() {
  return <p>oops we couldn&apos;t find that post - sorry!</p>;
}

export function ThreadHeading({
  metadata,
  threadName,
}: {
  metadata: Metadata;
  threadName: string;
}) {
  return (
    <div className={styles.heading}>
      <span className={styles.icons}>
        {metadata.admin && <LockClosedIcon width="24px" strokeWidth={3} />}
        {metadata.pinned && <PushPinSvg className={`${styles.pinIcon}`} />}
      </span>
      <h1 className={styles.threadName}>{threadName}</h1>
      <CategoryPills categories={metadata.categories} />
    </div>
  );
}
