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

export default function Support() {
  // TODO: update these values to fetch the correct threads
  const data = threadHooks.useThreads({
    filter: {
      location: {
        page: 'discord',
      },
    },
    sortDirection: 'ascending',
  });

  const threads = data.threads;

  return (
    <div className={styles.threads}>
      <div className={styles.header}>
        <h3>CUSTOMER NAME</h3>
      </div>
      <div className={styles.messages}>
        {threads.length > 0 &&
          !data.loading &&
          threads.map((thread) => <Message key={thread.id} thread={thread} />)}
        {!data.hasMore && (
          <div>
            <h4>This is the very beginning of the chat.</h4>
            {threads.length > 0 && <hr />}
          </div>
        )}
      </div>
      <Composer
        style={{ gridArea: 'composer' }}
        // this will be updated to have only the customer's group
        groupId="community_all"
        location={{ page: 'discord' }}
        showExpanded
      />
    </div>
  );
}

function Message({ thread }: { thread: ThreadSummary }) {
  const router = useRouter();

  const numOfReplies = thread.total - 1;
  const replyMessage = `${numOfReplies} ${
    numOfReplies === 1 ? 'reply' : 'replies'
  }`;

  return (
    <>
      <CordMessage
        threadId={thread.id}
        onClick={(msg) => router.push(`/support/${msg.threadId}`)}
        style={{ cursor: 'pointer', paddingBottom: 0 }}
      />
      {numOfReplies > 0 && (
        <div className={styles.messageReplies}>
          <Facepile users={thread.repliers} />
          <span>{replyMessage}</span>
        </div>
      )}
    </>
  );
}
