'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { thread as threadHooks, betaV2 } from '@cord-sdk/react';
import cx from 'classnames';
import Image from 'next/image';
import styles from './post.module.css';
import { getPostMetadata } from '@/utils';
import {
  CheckIcon,
  LockClosedIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { PushPinSvg } from '@/app/components/PushPinSVG';
import { CategoryPills } from '@/app/components/CategoryPills';
import { PostMetadata } from '@/app/types';
import { EntityMetadata } from '@cord-sdk/types';
import logo from '@/static/cord-icon.png';
import { SolutionLabel } from '@/app/components/SolutionLabel';
import ConfirmationModal from '@/app/components/ConfirmationModal';
import { deleteMessage, deleteThread } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { User } from '@/app/helpers/user';
import { THREAD_INITIAL_FETCH_COUNT } from '@/consts';
import CommunityTextEditor from '@/app/components/replacements/CommunityTextEditor';

const PostContext = createContext<{
  viewerUserID: string | null;
  viewerIsAdmin: boolean;
  isUserAdmin: (user: string) => boolean;
  threadID: string | null;
  metadata: EntityMetadata | null;
  displayPostDeletionModal: () => void;
  displayMessageDeletionModal: (messageID: string) => void;
}>({
  viewerUserID: null,
  viewerIsAdmin: false,
  isUserAdmin: (_) => false,
  threadID: null,
  metadata: null,
  displayPostDeletionModal: () => {},
  displayMessageDeletionModal: (_) => {},
});

const MessageContext = createContext<{
  messageID: string;
  isAnswer: boolean;
  viewerIsAuthor: boolean;
}>({
  messageID: '',
  isAnswer: false,
  viewerIsAuthor: false,
});

// This composer will only allow an Admin to comment if the post is locked
// Other users will see no composer
// If the post is not locked, the composer will appear normal
const LockedComposer = forwardRef(function LockedComposer(
  props: betaV2.ComposerProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const postContext = useContext(PostContext);
  const metadata = getPostMetadata(postContext?.metadata ?? undefined);
  if (metadata.locked && !postContext.viewerIsAdmin) {
    return null;
  }

  return <betaV2.Composer {...props} ref={ref} />;
});

const REPLACEMENTS: betaV2.ReplaceConfig = {
  Message: CommunityMessageWithContext,
  Timestamp: TimestampAndMaybeSolutionsLabel,
  Username: CommunityUsername,
  within: { OptionsMenu: { MenuButton: CommunityPostMenuButton } },
  TextEditor: CommunityTextEditor,
  Composer: LockedComposer,
  ScrollContainer: CommunityScrollContainer,
};

type ConfirmModalState = 'DELETE_POST' | 'DELETE_MESSAGE' | null;
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
  const { thread, loading } = threadData;

  const isUserAdmin = useCallback(
    (id: string) => {
      return adminMembersSet.has(id);
    },
    [adminMembersSet],
  );
  const displayPostDeletionModal = useCallback(() => {
    setConfirmModalState('DELETE_POST');
  }, []);
  const displayMessageDeletionModal = useCallback((messageID: string) => {
    setConfirmModalState('DELETE_MESSAGE');
    setMessageToDelete(messageID);
  }, []);

  const contextValue = useMemo(() => {
    return {
      viewerUserID: user.userID ?? null,
      viewerIsAdmin: user.isAdmin ?? false,
      isUserAdmin,
      threadID,
      metadata: thread?.metadata ?? null,
      displayPostDeletionModal,
      displayMessageDeletionModal,
    };
  }, [
    user.userID,
    user.isAdmin,
    isUserAdmin,
    threadID,
    thread?.metadata,
    displayPostDeletionModal,
    displayMessageDeletionModal,
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
  }, [confirmModalState, messageToDelete, threadID, onCloseModal, router]);

  if (!thread && !loading) {
    return <ThreadNotFound />;
  }
  const metadata = getPostMetadata(thread?.metadata);

  return (
    <PostContext.Provider value={contextValue}>
      <ThreadHeading metadata={metadata} threadName={thread?.name || ''} />
      <betaV2.Thread threadData={threadData} replace={REPLACEMENTS} />
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
  metadata: PostMetadata;
  threadName: string;
}) {
  return (
    <div className={styles.heading}>
      <span className={styles.icons}>
        {metadata.locked && <LockClosedIcon width="24px" strokeWidth={3} />}
        {metadata.pinned && <PushPinSvg className={`${styles.pinIcon}`} />}
      </span>
      <h1 className={styles.threadName}>{threadName}</h1>
      <CategoryPills categories={metadata.categories} />
    </div>
  );
}

function CommunityMessageWithContext(props: betaV2.MessageProps) {
  const postContext = useContext(PostContext);
  const metadata = getPostMetadata(postContext?.metadata ?? undefined);

  const contextValue = useMemo(() => {
    return {
      messageID: props.message.id,
      isAnswer: metadata.answerMessageID === props.message.id,
      viewerIsAuthor: props.message.authorID === postContext?.viewerUserID,
    };
  }, [
    metadata.answerMessageID,
    postContext?.viewerUserID,
    props.message.authorID,
    props.message.id,
  ]);

  return (
    <MessageContext.Provider value={contextValue}>
      <betaV2.Message {...props}></betaV2.Message>
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

function CommunityPostMenuButton(props: betaV2.MenuButtonProps) {
  const postContext = useContext(PostContext);
  const messageContext = useContext(MessageContext);
  const threadData = threadHooks.useThread(postContext.threadID ?? '');
  const isFirstMessage =
    threadData.thread?.firstMessage?.id === messageContext.messageID;

  const closeMenu = useCallback(() => {
    props.setMenuVisible(false);
  }, [props]);

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
        closeMenu();
      })
      .catch(console.error);
  }, [
    messageContext.messageID,
    closeMenu,
    postContext.metadata,
    postContext.threadID,
  ]);

  const onClickDeleteMessage = useCallback(async () => {
    postContext.displayMessageDeletionModal(messageContext.messageID);
    closeMenu();
  }, [postContext, closeMenu, messageContext.messageID]);

  const onClickDeletePost = useCallback(async () => {
    postContext.displayPostDeletionModal();
    closeMenu();
  }, [postContext, closeMenu]);

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
        <betaV2.MenuItem
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
        <betaV2.MenuItem
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
        <betaV2.MenuItem
          label={'Delete message'}
          menuItemAction="delete-message"
          onClick={onClickDeleteMessage}
          leftItem={<MenuItemLeftIcon iconFor={'delete-message'} />}
          className={styles.deleteActionMenuItem}
        />
      ),
    };
  }, [onClickDeleteMessage]);

  const communityMenuButtonProps = useMemo(() => {
    // Don't show resolve or delete messsage menu items. We don't use resolving/unresolving feature in
    // community and we replace the soft delete default option with a permanent delete menu option.
    const customizedItems = props.menuItems.filter(
      (item) => !['message-delete', 'thread-resolve'].includes(item.name),
    );

    if (postContext.viewerIsAdmin || messageContext.viewerIsAuthor) {
      // first messages should have `deletePost` item for authors and admins
      if (isFirstMessage) {
        customizedItems.push(deletePostMenuItem);
      } else {
        // only admins should be able to mark post as answered
        if (postContext.viewerIsAdmin) {
          customizedItems.push(markWithAnswer);
        }
        // all admins and message authors should be able to delete a message
        customizedItems.push(deleteMessageMenuItem);
      }
    }

    return {
      ...props,
      menuItems: customizedItems,
    };
  }, [
    props,
    postContext.viewerIsAdmin,
    messageContext.viewerIsAuthor,
    isFirstMessage,
    deletePostMenuItem,
    deleteMessageMenuItem,
    markWithAnswer,
  ]);

  return <betaV2.MenuButton {...communityMenuButtonProps} />;
}

function CommunityUsername(props: betaV2.UsernameProps) {
  const postContext = useContext(PostContext);
  if (!postContext || !postContext.isUserAdmin(props.userData?.id ?? '')) {
    return <betaV2.Username {...props} />;
  } else {
    return (
      <>
        <betaV2.Username {...props} />
        <Image src={logo} alt={`cord icon logo`} height={16} width={16} />
      </>
    );
  }
}

function TimestampAndMaybeSolutionsLabel(props: betaV2.TimestampProps) {
  const messageContext = useContext(MessageContext);
  return (
    <>
      <betaV2.Timestamp {...props} />
      {messageContext.isAnswer && (
        <SolutionLabel
          className={cx(styles.solutionLabel, styles.marginLeft)}
        />
      )}
    </>
  );
}

function CommunityScrollContainer(props: betaV2.ScrollContainerProps) {
  return <betaV2.ScrollContainer {...props} autoScrollToNewest={'never'} />;
}
