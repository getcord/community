'use client';

import {
  Composer,
  thread as threadHooks,
  Message as CordMessage,
  Facepile,
} from '@cord-sdk/react';
import { ThreadSummary } from '@cord-sdk/types';
import { useParams, useRouter } from 'next/navigation';
import styles from './support.module.css';
import { PaginationTrigger } from '@/app/components/PaginationTrigger';
import cx from 'classnames';

export default function Support({
  customerID,
  customerName,
}: {
  customerID: string;
  customerName: string;
}) {
  const { threadID } = useParams();
  const { threads, loading, fetchMore, hasMore } = threadHooks.useThreads({
    filter: {
      groupID: customerID,
    },
    sortDirection: 'descending',
  });

  return (
    <div
      className={cx(styles.supportChatContainer, {
        [styles.threadOpen]: threadID,
      })}
    >
      <div className={styles.header}>
        <h3>{customerName}</h3>
      </div>
      <div className={styles.threads}>
        {threads.map((thread) => (
          <CustomThread
            key={thread.id}
            thread={thread}
            customerID={customerID}
          />
        ))}
        <PaginationTrigger
          loading={loading}
          hasMore={hasMore}
          fetchMore={fetchMore}
        />
      </div>
      <Composer
        // this will be updated to have only the customer's group
        groupId={customerID}
        showExpanded
      />
    </div>
  );
}

function CustomThread({
  thread,
  customerID,
}: {
  thread: ThreadSummary;
  customerID: string;
}) {
  const router = useRouter();

  const numOfReplies = thread.total - 1;
  const replyMessage = `${numOfReplies} ${
    numOfReplies === 1 ? 'reply' : 'replies'
  }`;

  return (
    <div>
      <CordMessage
        threadId={thread.id}
        onClick={() => router.push(`/support/${customerID}/${thread.id}`)}
        style={{ cursor: 'pointer', paddingBottom: 0 }}
      />
      {numOfReplies > 0 && (
        <div
          className={styles.threadReplies}
          onClick={() => router.push(`/support/${customerID}/${thread.id}`)}
        >
          <Facepile users={thread.repliers} />
          <span>{replyMessage}</span>
        </div>
      )}
    </div>
  );
}
