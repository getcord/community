'use client';

import { Thread, thread as threadHooks } from '@cord-sdk/react';
import styles from './post.module.css';
import { getTypedMetadata, mapCategoryEndpointsToTitles } from '@/utils';
import { NavButton } from '@/app/components/NavButton';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { PushPinSvg } from '@/app/components/PushPinSVG';

export default function Post({ params }: { params?: { postID: string } }) {
  const threadID = decodeURIComponent(params?.postID || '');
  const thread = threadHooks.useThread(threadID);

  if (!params?.postID || !thread) {
    return <p>oops we couldn&apos;t find that post - sorry!</p>;
  }

  const metadata = getTypedMetadata(thread.thread?.metadata || {});

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <span className={styles.icons}>
          {metadata.admin && <LockClosedIcon width="24px" strokeWidth={3} />}
          {metadata.pinned && <PushPinSvg className={`${styles.pinIcon}`} />}
        </span>
        <h1 className={styles.threadName}>{thread.thread?.name}</h1>
      </div>
      <NavButton
        type="category"
        value={mapCategoryEndpointsToTitles(metadata.category || '')}
        linkTo={`/${metadata.category}`}
        isActive={false}
      />
      <Thread threadId={threadID} />
    </div>
  );
}
