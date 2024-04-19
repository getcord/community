'use client';

import { thread as threadHooks, experimental } from '@cord-sdk/react';
import cx from 'classnames';
import Image from 'next/image';
import styles from './post.module.css';
import { getTypedMetadata } from '@/utils';
import {
  CheckIcon,
  LockClosedIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
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
import ConfirmationModal from '@/app/components/ConfirmationModal';
import { deleteMessage, deleteThread } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/app/helpers/user';
import { THREAD_INITIAL_FETCH_COUNT } from '@/consts';
import CommunityTextEditor from '@/app/components/replacements/CommunityTextEditor';

type ConfirmModalState = 'DELETE_POST' | 'DELETE_MESSAGE' | null;
const PostContext = createContext<{
  userIsAdmin: boolean;
  threadID: string | null;
  metadata: EntityMetadata | null;
  admins: Set<string>;
  viewerUserID: string | null;
  confirmModalState: ConfirmModalState;
  setConfirmModalState: (value: ConfirmModalState) => void;
  messageToDelete: string | null;
  setMessageToDelete: (id: string | null) => void;
}>({
  userIsAdmin: false,
  threadID: null,
  metadata: null,
  admins: new Set(),
  viewerUserID: null,
  confirmModalState: null,
  setConfirmModalState: () => {},
  messageToDelete: null,
  setMessageToDelete: () => {},
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
  Timestamp: TimestampAndMaybeSolutionsLabel,
  Username: CommunityUsername,
  within: { OptionsMenu: { Menu: CommunityMenu } },
  TextEditor: CommunityTextEditor,
};

export default function Post({
  threadID,
  user,
  adminMembersSet,
}: {
  threadID: string;
  user: User;
  adminMembersSet: Set<string>;
}) {
  const router = useRouter();

  const [confirmModalState, setConfirmModalState] =
    useState<ConfirmModalState>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const threadData = threadHooks.useThread(threadID, {
    initialFetchCount: THREAD_INITIAL_FETCH_COUNT,
  });
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
      userIsAdmin: user.isAdmin ?? false,
      admins: adminMembersSet,
      viewerUserID: user.userID ?? null,
      confirmModalState,
      setConfirmModalState,
      setMessageToDelete,
      messageToDelete,
    };
  }, [
    threadID,
    thread?.metadata,
    user.isAdmin,
    user.userID,
    adminMembersSet,
    confirmModalState,
    messageToDelete,
  ]);

  const onCloseModal = useCallback(() => {
    setConfirmModalState(null);
    setMessageToDelete(null);
  }, []);

  const onConfirmModal = useCallback(async () => {
    if (confirmModalState === 'DELETE_POST') {
      await deleteThread(threadID);
      router.replace('/');
    }

    if (confirmModalState === 'DELETE_MESSAGE') {
      if (!messageToDelete) {
        return;
      }
      await deleteMessage(threadID, messageToDelete);
    }

    onCloseModal();
  }, [confirmModalState, messageToDelete, threadID]);

  if (!thread && !loading) {
    return <ThreadNotFound />;
  }
  const metadata = getTypedMetadata(thread?.metadata);

  return (
    <PostContext.Provider value={contextValue}>
      <ThreadHeading metadata={metadata} threadName={thread?.name || ''} />
      <experimental.Thread thread={threadData} replace={REPLACEMENTS} />
      <ConfirmationModal
        onClose={onCloseModal}
        isOpen={!!confirmModalState}
        onConfirm={onConfirmModal}
        title={
          confirmModalState === 'DELETE_POST' ? 'Delete Post' : 'Delete Message'
        }
        confirmActionText={'Delete'}
      >
        <p>
          Are you sure you want to permanently delete this{' '}
          {confirmModalState === 'DELETE_POST' ? 'post' : 'message'}? This
          action cannot be undone.
        </p>
      </ConfirmationModal>
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

  const contextValue = useMemo(() => {
    return {
      messageID: props.message.id,
      isAnswer: metadata.answerMessageID === props.message.id,
      userIsAuthor: props.message.authorID === postContext?.viewerUserID,
    };
  }, [
    metadata.answerMessageID,
    postContext?.viewerUserID,
    props.message.authorID,
    props.message.id,
  ]);

  return (
    <MessageContext.Provider value={contextValue}>
      <experimental.Message {...props}></experimental.Message>
    </MessageContext.Provider>
  );
}

type CustomMenuItemName = 'mark-as-answer' | 'delete-post' | 'delete-message';
function MenuItemLeftIcon(props: {
  iconFor: CustomMenuItemName;
  active?: boolean;
}) {
  switch (props.iconFor) {
    case 'mark-as-answer':
      return <CheckIcon width={16} className={styles.leftIcon} />;
    case 'delete-post':
    case 'delete-message':
      return <TrashIcon width={16} className={styles.leftIcon} />;
  }
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

  const onClickDeleteMessage = useCallback(async () => {
    postContext.setConfirmModalState('DELETE_MESSAGE');
    postContext.setMessageToDelete(messageContext.messageID);

    props.closeMenu();
  }, [postContext, props]);

  const onClickDeletePost = useCallback(async () => {
    postContext.setConfirmModalState('DELETE_POST');
    props.closeMenu();
  }, [postContext, props]);

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
          leftItem={<MenuItemLeftIcon iconFor={'mark-as-answer'} />}
          className={cx({
            [styles.markedAsAnswered]: isMarkedAsAnswer,
          })}
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
          onClick={onClickDeletePost}
          leftItem={<MenuItemLeftIcon iconFor={'delete-post'} />}
          className={styles.deleteActionMenuItem}
        />
      ),
    };
  }, [onClickDeletePost]);

  const deleteMessageMenuItem = useMemo(() => {
    return {
      name: 'delete-message',
      element: (
        <experimental.MenuItem
          label={'Delete message'}
          menuItemAction="delete-message"
          onClick={onClickDeleteMessage}
          leftItem={<MenuItemLeftIcon iconFor={'delete-message'} />}
          className={styles.deleteActionMenuItem}
        />
      ),
    };
  }, [onClickDeleteMessage]);

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

  return <experimental.Menu {...communityMenuProps} />;
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
