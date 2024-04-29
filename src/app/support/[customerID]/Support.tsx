'use client';

import {
  Composer,
  thread as threadHooks,
  Facepile,
  betaV2,
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

function SupportMessageMenu(props: betaV2.MenuProps) {
  const updatedProps = {
    ...props,
    items: props.items.filter((item) => item.name !== 'thread-resolve'),
  };
  return <betaV2.Menu {...updatedProps} />;
}

function CustomThread({
  thread,
  customerID,
}: {
  thread: ThreadSummary;
  customerID: string;
}) {
  const router = useRouter();
  if (!thread.firstMessage) {
    return <></>;
  }

  const numOfReplies = thread.total - 1;
  const replyMessage = `${numOfReplies} ${
    numOfReplies === 1 ? 'reply' : 'replies'
  }`;

  return (
    <div
      className={styles.threadContainer}
        onClick={() => router.push(`/support/${customerID}/${thread.id}`)}
    >
      <betaV2.Message
        message={thread.firstMessage}
        showThreadOptions
        replace={{
          within: {
            OptionsMenu: {
              Menu: SupportMessageMenu,
            },
          },
        }}
      />
      {numOfReplies > 0 && (
        <div className={styles.threadReplies}>
          <Facepile users={thread.repliers} />
          <span>{replyMessage}</span>
        </div>
      )}
    </div>
  );
}
