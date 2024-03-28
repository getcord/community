'use client';

import {
  Composer,
  thread as threadHooks,
  Message as CordMessage,
  Facepile,
} from '@cord-sdk/react';
import { ThreadSummary } from '@cord-sdk/types';
import { useRouter } from 'next/navigation';
import styles from './support.module.css';

export default function Support({
  customerID,
  customerName,
}: {
  customerID: string;
  customerName: string;
}) {
  const data = threadHooks.useThreads({
    filter: {
      groupID: customerID,
    },
    sortDirection: 'descending',
  });

  const threads = data.threads;

  return (
    <div className={styles.threads}>
      <div className={styles.header}>
        <h3>{customerName}</h3>
      </div>
      <div className={styles.messages}>
        {threads.length > 0 &&
          !data.loading &&
          threads.map((thread) => (
            <Message key={thread.id} thread={thread} customerID={customerID} />
          ))}
        {!data.hasMore && (
          <div>
            <h4>This is the very beginning of the chat.</h4>
            {threads.length > 0 && <hr />}
          </div>
        )}
      </div>
      <Composer
        // margin matches that in the thread details
        style={{ gridArea: 'composer', marginTop: '12px' }}
        // this will be updated to have only the customer's group
        groupId={customerID}
        showExpanded
      />
    </div>
  );
}

function Message({
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
          className={styles.messageReplies}
          onClick={() => router.push(`/support/${customerID}/${thread.id}`)}
        >
          <Facepile users={thread.repliers} />
          <span>{replyMessage}</span>
        </div>
      )}
    </div>
  );
}
