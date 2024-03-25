'use client';

import { Composer, Message, thread as threadHooks } from '@cord-sdk/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import styles from './threadDetails.module.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ThreadDetails({
  params,
}: {
  params?: { threadId: string };
}) {
  const threadId = params?.threadId && decodeURIComponent(params.threadId);
  const router = useRouter();
  if (!threadId) {
    return <h1>oops can&apos;t find this thread!</h1>;
  }

  return (
    <div className={styles.drawer} key={threadId}>
      <div className={styles.drawerHeader}>
        <h3>Thread</h3>
        <button
          aria-label="close thread details"
          onClick={() => router.push('/support')}
          className={styles.drawerClose}
        >
          <XMarkIcon width="14px" />
        </button>
      </div>
      <div className={styles.threadWrapper}>
        <Thread threadId={threadId} />
      </div>
      {/* THIS WILL NEED TO BE CONFIGURED PROPERLY TOO */}
      <Composer
        groupId="community_all"
        location={{ page: 'discord' }}
        threadId={threadId}
      />
    </div>
  );
}

function Thread({ threadId }: { threadId: string }) {
  const data = threadHooks.useThread(threadId);

  useEffect(() => {
    if (data.hasMore) {
      data.fetchMore(10);
    }
  }, [data]);

  const replies = data.messages.slice(1);
  const numOfReplies = replies.length;
  const repliesText = `${numOfReplies} ${numOfReplies === 1 ? 'reply' : 'replies'}`;

  return (
    <>
      <Message threadId={threadId} />
      {replies.length > 0 && (
        <div className={styles.divider}>
          <span>{repliesText}</span>
          <hr className={styles.line} />
        </div>
      )}
      {replies.length > 0 &&
        replies.map((reply) => (
          <Message key={reply.id} threadId={threadId} messageId={reply.id} />
        ))}
    </>
  );
}
