'use client';

import { thread as threadHooks, betaV2 } from '@cord-sdk/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import styles from './threadDetails.module.css';
import { useRouter } from 'next/navigation';
import { PaginationTrigger } from '@/app/components/PaginationTrigger';

const REPLACEMENTS: betaV2.ReplaceConfig = {
  ThreadLayout: CommunityThreadLayout,
};
export default function ThreadDetails({
  params,
}: {
  params: { customerID: string; threadID: string };
}) {
  const threadID = decodeURIComponent(params.threadID);
  const threadData = threadHooks.useThread(threadID);

  const customerID = decodeURIComponent(params.customerID);
  const router = useRouter();

  return (
    <div className={styles.drawer} key={threadID}>
      <div className={styles.drawerHeader}>
        <h3>Thread</h3>
        <button
          aria-label="close thread details"
          onClick={() => router.push(`/support/${customerID}`)}
          className={styles.drawerClose}
        >
          <XMarkIcon width="14px" />
        </button>
      </div>
      <betaV2.Thread threadData={threadData} replace={REPLACEMENTS} />
    </div>
  );
}

function CommunityThreadLayout(props: betaV2.ThreadLayoutProps) {
  const threadData = props.threadData;
  if (!threadData) {
    return <betaV2.ThreadLayout {...props} />;
  }

  const messagesWithReplyCount = threadData.messages.map((message) => {
    const { loading, fetchMore, hasMore, thread } = threadData;

    if (
      message.id !== thread?.firstMessage?.id ||
      loading === undefined ||
      fetchMore === undefined ||
      hasMore === undefined
    ) {
      return <betaV2.Message key={message.id} message={message} />;
    }

    const numReplies = (thread?.total ?? 1) - 1;
    const repliesText = `${numReplies} ${
      numReplies === 1 ? 'reply' : 'replies'
    }`;
    return (
      <>
        <betaV2.Message key={message.id} message={message} />
        {numReplies > 0 && (
          <div className={styles.divider}>
            <span>{repliesText}</span>
            <hr className={styles.line} />
          </div>
        )}
        <PaginationTrigger
          loading={loading}
          hasMore={hasMore}
          fetchMore={fetchMore}
        />
      </>
    );
  });

  return <betaV2.ThreadLayout {...props} messages={messagesWithReplyCount} />;
}
