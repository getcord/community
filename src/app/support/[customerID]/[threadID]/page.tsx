'use client';

import { thread as threadHooks, betaV2 } from '@cord-sdk/react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import styles from './threadDetails.module.css';
import { useRouter } from 'next/navigation';
import { PaginationTrigger } from '@/app/components/PaginationTrigger';
import { Fragment, forwardRef } from 'react';

const CommunityThreadLayout = forwardRef(function CommunityThreadLayout(
  props: betaV2.ThreadLayoutProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const threadData = props.threadData;
  if (!threadData) {
    return <betaV2.ThreadLayout ref={ref} {...props} />;
  }

  const { loading, fetchMore, hasMore, thread } = threadData;
  if (!thread && !loading) {
    return <h4>oops can&apos;t find this thread!</h4>;
  }

  const messagesWithReplyCount = threadData.messages.map((message) => {
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
      <Fragment key={'fragment_key'}>
        <betaV2.Message message={message} />
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
      </Fragment>
    );
  });

  return (
    <betaV2.ThreadLayout
      ref={ref}
      {...props}
      messages={messagesWithReplyCount}
    />
  );
});

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
