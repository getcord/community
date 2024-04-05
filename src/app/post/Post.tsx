'use client';

import { Thread, thread as threadHooks, experimental } from '@cord-sdk/react';
import styles from './post.module.css';
import { getTypedMetadata } from '@/utils';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { PushPinSvg } from '@/app/components/PushPinSVG';
import { CategoryPills } from '@/app/components/CategoryPills';
import { Metadata } from '@/app/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import {
  MenuProps,
  MessageProps,
  OptionsMenuProps,
} from '@cord-sdk/react/dist/mjs/types/experimental';
import { EntityMetadata } from '@cord-sdk/types';

export type ThreadData = {
  id: string;
  metadata: Metadata;
  name: string;
};

const ThreadContext = createContext<{
  threadID: string | null;
  metadata: EntityMetadata | null;
}>({
  threadID: null,
  metadata: null,
});

const MessageContext = createContext<{ messageID: string | null }>({
  messageID: null,
});

export default function Post({
  threadID,
  isAdmin,
}: {
  threadID: string;
  isAdmin: boolean;
}) {
  const threadData = threadHooks.useThread(threadID);
  const { thread, loading, hasMore, fetchMore } = threadData;
  useEffect(() => {
    if (hasMore) {
      void fetchMore(10);
    }
  }, [hasMore, fetchMore]);

  const contextValue = useMemo(() => {
    return { threadID, metadata: thread?.metadata ?? null };
  }, [thread?.metadata, threadID]);

  if (!thread && !loading) {
    return <ThreadNotFound />;
  }
  const metadata = getTypedMetadata(thread?.metadata);

  return (
    <ThreadContext.Provider value={contextValue}>
      <ThreadHeading metadata={metadata} threadName={thread?.name || ''} />
      {!isAdmin ? (
        <Thread threadId={threadID} />
      ) : (
        <experimental.Thread
          thread={threadData}
          replace={{ Message: CommunityMessage }}
        />
      )}
    </ThreadContext.Provider>
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

export function OptionsMenuWithMarkAnswer(props: OptionsMenuProps) {
  return (
    <experimental.OptionsMenu
      {...props}
      replace={{ Menu: MenuWithMarkAnswer }}
    />
  );
}

export function CommunityMessage(props: MessageProps) {
  const contextValue = useMemo(() => {
    return { messageID: props.message.id };
  }, [props.message.id]);
  return (
    <MessageContext.Provider value={contextValue}>
      <experimental.Message
        {...props}
        replace={{ OptionsMenu: OptionsMenuWithMarkAnswer }}
      />
    </MessageContext.Provider>
  );
}

export function MenuWithMarkAnswer(props: MenuProps) {
  const threadContext = useContext(ThreadContext);
  const messageContext = useContext(MessageContext);
  const markAsAnswer = useCallback(() => {
    if (!window.CordSDK) {
      console.error('Cord SDK not found');
      return;
    }
    if (!threadContext.threadID) {
      console.error('Thread ID not found');
      return;
    }
    if (!messageContext.messageID) {
      console.error('Message ID not found');
      return;
    }
    window.CordSDK.thread
      .updateThread(threadContext.threadID, {
        metadata: {
          ...threadContext.metadata,
          answerMessageID: messageContext.messageID,
        },
      })
      .then(() => {
        props.closeMenu();
      })
      .catch(console.error);
  }, [
    messageContext.messageID,
    props,
    threadContext.metadata,
    threadContext.threadID,
  ]);

  const markWithAnswer = useMemo(() => {
    return {
      name: 'mark-as-answer',
      element: (
        <experimental.MenuItem
          label="Mark as answer"
          menuItemAction="mark-as-answer"
          onClick={markAsAnswer}
        />
      ),
    };
  }, [markAsAnswer]);

  const propsWithMarkAnswer = useMemo(() => {
    return {
      ...props,
      items: [markWithAnswer, ...props.items],
    };
  }, [markWithAnswer, props]);
  return <experimental.Menu {...propsWithMarkAnswer} />;
}
