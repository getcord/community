'use client';

import { thread as threadHooks, experimental, user } from '@cord-sdk/react';
import Image from 'next/image';
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
  useState,
} from 'react';

import {
  MenuItemProps,
  MenuProps,
  MessageProps,
  UsernameProps,
} from '@cord-sdk/react/dist/mjs/types/experimental';
import { EntityMetadata } from '@cord-sdk/types';
import logo from '@/static/cord-logo-grey.svg';
import { getUserById } from '@/app/helpers/user';

const PostContext = createContext<{
  userIsAdmin: boolean;
  threadID: string | null;
  metadata: EntityMetadata | null;
  admins: Set<string>;
}>({
  userIsAdmin: false,
  threadID: null,
  metadata: null,
  admins: new Set(),
});

const MessageContext = createContext<{ messageID: string | null }>({
  messageID: null,
});

const REPLACEMENTS: experimental.ReplaceConfig = {
  Message: CommunityMessageWithContext,
  Menu: CommunityMenu,
  MenuItem: CommunityMenuItem,
  Username: CommunityUsername,
};

export default function Post({
  threadID,
  isAdmin,
  adminMembersSet,
}: {
  threadID: string;
  isAdmin: boolean;
  adminMembersSet: Set<string>;
}) {
  const threadData = threadHooks.useThread(threadID);
  const { thread, loading, hasMore, fetchMore } = threadData;

  useEffect(() => {
    if (hasMore) {
      void fetchMore(10);
    }
  }, [hasMore, fetchMore]);

  const contextValue = useMemo(() => {
    return {
      threadID,
      metadata: thread?.metadata ?? null,
      userIsAdmin: isAdmin,
      admins: adminMembersSet,
    };
  }, [adminMembersSet, isAdmin, thread?.metadata, threadID]);

  if (!thread && !loading) {
    return <ThreadNotFound />;
  }
  const metadata = getTypedMetadata(thread?.metadata);

  return (
    <PostContext.Provider value={contextValue}>
      <ThreadHeading metadata={metadata} threadName={thread?.name || ''} />
      <experimental.Thread thread={threadData} replace={REPLACEMENTS} />
    </PostContext.Provider>
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

function CommunityMessageWithContext(props: MessageProps) {
  const contextValue = useMemo(() => {
    return { messageID: props.message.id };
  }, [props.message.id]);
  return (
    <MessageContext.Provider value={contextValue}>
      <experimental.Message {...props} />
    </MessageContext.Provider>
  );
}

function CommunityMenu(props: MenuProps) {
  const postContext = useContext(PostContext);
  const messageContext = useContext(MessageContext);
  const threadData = threadHooks.useThread(postContext.threadID ?? '');
  const isFirstMessage =
    threadData.thread?.firstMessage?.id === messageContext.messageID;
  const markAsAnswer = useCallback(() => {
    if (!window.CordSDK) {
      console.error('Cord SDK not found');
      return;
    }
    if (!postContext.threadID) {
      console.error('Thread ID not found');
      return;
    }
    if (!messageContext.messageID) {
      console.error('Message ID not found');
      return;
    }
    window.CordSDK.thread
      .updateThread(postContext.threadID, {
        metadata: {
          ...postContext.metadata,
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
    postContext.metadata,
    postContext.threadID,
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

  const communityMenuProps = useMemo(() => {
    // Don't show the Mark as Answer menu item if the user is not admin
    // or if it is the first message
    if (!postContext.userIsAdmin || isFirstMessage) {
      return props;
    }

    return {
      ...props,
      items: [markWithAnswer, ...props.items],
    };
  }, [markWithAnswer, postContext.userIsAdmin, props, isFirstMessage]);

  return <experimental.Menu {...communityMenuProps} />;
}

function CommunityMenuItem(props: MenuItemProps) {
  if (props.menuItemAction !== 'thread-resolve') {
    return <experimental.MenuItem {...props} />;
  }
  return null;
}

function CommunityUsername(props: UsernameProps) {
  const postContext = useContext(PostContext);
  if (!postContext || !postContext.admins.has(props.userData?.id ?? '')) {
    return <experimental.Username {...props} />;
  } else {
    return (
      <>
        <experimental.Username {...props} />
        <Image src={logo} alt={`cord icon logo`} height={16} width={48} />
      </>
    );
  }
}
