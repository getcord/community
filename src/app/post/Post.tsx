'use client';

import { thread as threadHooks, experimental, user } from '@cord-sdk/react';
import cx from 'classnames';
import Image from 'next/image';
import styles from './post.module.css';
import { getTypedMetadata } from '@/utils';
import { LockClosedIcon, TrashIcon } from '@heroicons/react/24/outline';
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
  MenuProps,
  MessageProps,
  TimestampProps,
  UsernameProps,
} from '@cord-sdk/react/dist/mjs/types/experimental';
import { EntityMetadata } from '@cord-sdk/types';
import logo from '@/static/cord-icon.png';
import { SolutionLabel } from '@/app/components/SolutionLabel';
import DeletePostModal from '@/app/components/DeletePostModal';

type ModalState = 'POST' | 'MESSAGE' | null;
const PostContext = createContext<{
  userIsAdmin: boolean;
  threadID: string | null;
  metadata: EntityMetadata | null;
  admins: Set<string>;
  deleteModalState: ModalState;
  setDeleteModalState: (value: ModalState) => void;
}>({
  userIsAdmin: false,
  threadID: null,
  metadata: null,
  admins: new Set(),
  deleteModalState: null,
  setDeleteModalState: () => {},
});

const MessageContext = createContext<{
  messageID: string | null;
  isAnswer: boolean;
  userIsAuthor: boolean;
}>({
  messageID: null,
  isAnswer: false,
  userIsAuthor: false,
});

const REPLACEMENTS: experimental.ReplaceConfig = {
  Message: CommunityMessageWithContext,
  Menu: CommunityMenu,
  Timestamp: TimestampAndMaybeSolutionsLabel,
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
  const [deleteModalState, setDeleteModalState] = useState<ModalState>(null);

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
      deleteModalState,
      setDeleteModalState,
    };
  }, [adminMembersSet, deleteModalState, isAdmin, thread?.metadata, threadID]);

  const onCloseModal = useCallback(() => {
    setDeleteModalState(null);
  }, []);

  if (!thread && !loading) {
    return <ThreadNotFound />;
  }
  const metadata = getTypedMetadata(thread?.metadata);

  return (
    <PostContext.Provider value={contextValue}>
      <ThreadHeading metadata={metadata} threadName={thread?.name || ''} />
      <experimental.Thread thread={threadData} replace={REPLACEMENTS} />
      <DeletePostModal
        onClose={onCloseModal}
        isOpen={deleteModalState === 'POST'}
        threadID={threadID}
      />
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
  const postContext = useContext(PostContext);
  const metadata = getTypedMetadata(postContext?.metadata ?? undefined);
  const data = user.useViewerData();

  const contextValue = useMemo(() => {
    return {
      messageID: props.message.id,
      isAnswer: metadata.answerMessageID === props.message.id,
      userIsAuthor: props.message.authorID === data?.id,
    };
  }, [
    data?.id,
    metadata.answerMessageID,
    props.message.authorID,
    props.message.id,
  ]);

  const onCloseModal = useCallback(() => {
    postContext.setDeleteModalState(null);
  }, [postContext]);

  return (
    <MessageContext.Provider value={contextValue}>
      <experimental.Message {...props}></experimental.Message>
      <DeletePostModal
        onClose={onCloseModal}
        isOpen={postContext.deleteModalState === 'MESSAGE'}
        threadID={props.message.threadID}
        messageID={props.message.id}
      />
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

  const deleteMessage = useCallback(() => {
    postContext.setDeleteModalState('MESSAGE');
  }, [postContext]);

  const deletePost = useCallback(() => {
    postContext.setDeleteModalState('POST');
  }, [postContext]);

  const { threadHasAnswer, isMarkedAsAnswer } = useMemo(() => {
    const answerMessageID = threadData?.thread?.metadata.answerMessageID;
    return {
      threadHasAnswer: Boolean(answerMessageID),
      isMarkedAsAnswer: answerMessageID === messageContext.messageID,
    };
  }, [messageContext.messageID, threadData?.thread?.metadata.answerMessageID]);

  const markWithAnswer = useMemo(() => {
    return {
      name: 'mark-as-answer',
      element: (
        <experimental.MenuItem
          label={
            isMarkedAsAnswer
              ? 'Marked as answer'
              : threadHasAnswer
              ? 'Mark as new answer'
              : 'Mark as answer'
          }
          menuItemAction="mark-as-answer"
          onClick={markAsAnswer}
          disabled={isMarkedAsAnswer}
        />
      ),
    };
  }, [isMarkedAsAnswer, markAsAnswer, threadHasAnswer]);

  const deletePostMenuItem = useMemo(() => {
    return {
      name: 'delete-post',
      element: (
        <experimental.MenuItem
          label={'Delete post'}
          menuItemAction="delete-post"
          onClick={deletePost}
          leftItem={
            <TrashIcon width={16} height={16} className={styles.leftIcon} />
          }
        />
      ),
    };
  }, [deletePost]);

  const deleteMessageMenuItem = useMemo(() => {
    return {
      name: 'delete-message',
      element: (
        <experimental.MenuItem
          label={'Delete message'}
          menuItemAction="delete-message"
          onClick={deleteMessage}
          leftItem={
            <TrashIcon width={16} height={16} className={styles.leftIcon} />
          }
        />
      ),
    };
  }, [deleteMessage]);

  const communityMenuProps = useMemo(() => {
    // Don't show resolve or delete messsage menu items. We don't use resolving/unresolving feature in
    // community and we replace the soft delete default option with a permanent delete menu option.
    const customizedItems = props.items.filter(
      (item) => !['message-delete', 'thread-resolve'].includes(item.name),
    );

    if (postContext.userIsAdmin || messageContext.userIsAuthor) {
      // first messages should have `deletePost` item for authors and admins
      if (isFirstMessage) {
        customizedItems.push(deletePostMenuItem);
      } else {
        // only admins should be able to mark post as answered
        if (postContext.userIsAdmin) {
          customizedItems.push(markWithAnswer);
        }
        // all admins and message authors should be able to delete a message
        customizedItems.push(deleteMessageMenuItem);
      }
    }

    return {
      ...props,
      items: customizedItems,
    };
  }, [
    props,
    postContext.userIsAdmin,
    messageContext.userIsAuthor,
    isFirstMessage,
    deletePostMenuItem,
    deleteMessageMenuItem,
    markWithAnswer,
  ]);

  return (
    !postContext.deleteModalState && (
      <experimental.Menu {...communityMenuProps} />
    )
  );
}

function CommunityUsername(props: UsernameProps) {
  const postContext = useContext(PostContext);
  if (!postContext || !postContext.admins.has(props.userData?.id ?? '')) {
    return <experimental.Username {...props} />;
  } else {
    return (
      <>
        <experimental.Username {...props} />
        <Image src={logo} alt={`cord icon logo`} height={16} width={16} />
      </>
    );
  }
}

function TimestampAndMaybeSolutionsLabel(props: TimestampProps) {
  const messageContext = useContext(MessageContext);
  return (
    <>
      <experimental.Timestamp {...props} />
      {messageContext.isAnswer && (
        <SolutionLabel
          className={cx(styles.solutionLabel, styles.marginLeft)}
        />
      )}
    </>
  );
}
