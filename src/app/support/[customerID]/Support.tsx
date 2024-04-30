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
import { createContext, forwardRef, useContext } from 'react';

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

const SupportMessageOptionButton = forwardRef(
  function SupportMessageOptionButton(
    props: betaV2.GeneralButtonProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) {
    return (
      <betaV2.Button
        ref={ref}
        {...props}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          e.stopPropagation();

          props.onClick?.(e);
        }}
      />
    );
  },
);

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

  const numOfReplies = thread?.total - 1;

  return (
    <ThreadFirstMessagContext.Provider value={{ thread, numOfReplies }}>
      <div
        className={cx(styles.threadContainer, {
          [styles.hasReplies]: numOfReplies > 0,
        })}
        onClick={() => router.push(`/support/${customerID}/${thread.id}`)}
      >
        <betaV2.Message
          message={thread.firstMessage}
          showThreadOptions
          replace={{
            within: {
              OptionsMenu: {
                Menu: SupportMessageMenu,
                Button: SupportMessageOptionButton,
              },
            },
            MessageLayout,
          }}
        />
      </div>
    </ThreadFirstMessagContext.Provider>
  );
}

type ThreadFirstMessageType = {
  thread: ThreadSummary | undefined;
  numOfReplies: number;
};

export const ThreadFirstMessagContext = createContext<ThreadFirstMessageType>({
  thread: undefined,
  numOfReplies: 0,
});

function MessageLayout(props: betaV2.MessageLayoutProps) {
  const { thread, numOfReplies } = useContext(ThreadFirstMessagContext);
  if (!thread) {
    return null;
  }

  const replyMessage = `${numOfReplies} ${
    numOfReplies === 1 ? 'reply' : 'replies'
  }`;
  return (
    <div {...props}>
      {props.avatar}
      {props.authorName}
      {props.timestamp}
      {props.messageContent}
      {props.reactions}

      {/* Since optionMenu lives within containers in MessageLayout and the containers
      aren't currently exposed in layoutProps - we have to create our own custom containers, 
      and pass in the cord classnames to maintain the default positioning of the optionsMenu
      */}
      <div className={'cord-options-menu-trigger'}>
        <div className={'cord-message-options-buttons'}>
          {props.optionsMenu}
          {props.emojiPicker}
        </div>
      </div>
      {numOfReplies > 0 && (
        <div className={styles.threadReplies}>
          <Facepile users={thread.repliers} />
          <span>{replyMessage}</span>
        </div>
      )}
    </div>
  );
}
