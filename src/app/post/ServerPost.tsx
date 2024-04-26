import {
  ClientMessageData,
  ThreadSummary,
  ClientThreadData,
  ClientUserData,
  MessageContent,
  MessageNodeType,
} from '@cord-sdk/types';
import cx from 'classnames';
import { getPostMetadata } from '@/utils';
import {
  CordAvatar,
  CordMessageContent,
  CordTimestamp,
  CordUserDataProvider,
} from '../components/CordClient';
import { ThreadNotFound, ThreadHeading } from './Post';
import styles from './post.module.css';
import { fetchCordRESTClientApi } from '../fetchCordRESTApi';
import Image from 'next/image';
import Button from '../ui/Button';
import { getStructuredQAData } from '@/lib/structuredData';
import { JSONLD } from '@/lib/JSONLD';
import logo from '@/static/cord-icon.png';
import { PostMetadata } from '@/app/types';
import { SolutionLabel } from '@/app/components/SolutionLabel';
import { THREAD_INITIAL_FETCH_COUNT } from '@/consts';

function collectMentionedUserIDs(content: MessageContent, result: Set<string>) {
  for (const node of content) {
    if (node.type === MessageNodeType.MENTION) {
      result.add(node.user.id);
    } else if ('children' in node) {
      const children = node.children;
      if (children) {
        collectMentionedUserIDs(children, result);
      }
    }
  }
}

function collectUserIDs(messages: ClientMessageData[]): string[] {
  const result = new Set<string>();
  for (const message of messages) {
    result.add(message.authorID);
    if (message.content) {
      collectMentionedUserIDs(message.content, result);
    }
  }
  return [...result];
}

async function getData(
  threadID: string,
): Promise<
  | [ThreadSummary, ClientMessageData[], Record<string, ClientUserData | null>]
  | undefined
> {
  const result = await fetchCordRESTClientApi<ClientThreadData>(
    'anonymous',
    `/thread/${threadID}?initialFetchCount=${THREAD_INITIAL_FETCH_COUNT}`,
  );
  if (!(result?.thread && result?.messages && result.messages.length > 0)) {
    return undefined;
  }
  const userResult = await fetchCordRESTClientApi<
    Record<string, ClientUserData | null>
  >(
    'anonymous',
    `/users?users=${encodeURIComponent(
      JSON.stringify(collectUserIDs(result.messages)),
    )}`,
  );
  if (!userResult) {
    return undefined;
  }
  return [result.thread, result.messages, userResult];
}

export default async function ServerPost({
  threadID,
  adminMembersSet,
}: {
  threadID: string;
  adminMembersSet: Set<string>;
}) {
  const data = await getData(threadID);
  if (!data) {
    return <ThreadNotFound />;
  }
  const [thread, messages, users] = data;

  if (!thread || !messages) {
    return <ThreadNotFound />;
  }
  const metadata = getPostMetadata(thread.metadata);

  const structuredData = getStructuredQAData(thread, messages);

  return (
    <CordUserDataProvider value={{ users }}>
      {structuredData && <JSONLD json={structuredData} />}
      <ThreadHeading metadata={metadata} threadName={thread.name} />
      <ServerThread
        messages={messages}
        metadata={metadata}
        adminMembersSet={adminMembersSet}
        users={users}
      />
      <LoggedOutComposer postID={threadID} />
    </CordUserDataProvider>
  );
}

function ServerThread({
  messages,
  metadata,
  adminMembersSet,
  users,
}: {
  messages: ClientMessageData[];
  metadata: PostMetadata;
  adminMembersSet: Set<string>;
  users: Record<string, ClientUserData | null>;
}) {
  return (
    <div>
      {messages.map((message) => (
        <div key={message.id} className={styles.serverMessage}>
          <ServerAuthorTimestamp
            user={users[message.authorID]}
            timestamp={message.updatedTimestamp ?? message.createdTimestamp}
            isAnswer={metadata.answerMessageID === message.id}
            authorIsAdmin={adminMembersSet.has(message.authorID)}
          />
          <CordMessageContent
            edited={false}
            attachments={message.attachments}
            content={message.content}
            className={styles.serverMessageContent}
            authorData={users[message.authorID]}
          />
          {/* TODO: reactions */}
        </div>
      ))}
    </div>
  );
}

function ServerAuthorTimestamp({
  user,
  timestamp,
  isAnswer,
  authorIsAdmin,
}: {
  user: ClientUserData | null;
  timestamp: Date;
  isAnswer: boolean;
  authorIsAdmin: boolean;
}) {
  return (
    <>
      {user && <CordAvatar user={user} />}
      <div className={styles.serverNameAndTimestamp}>
        <span className={styles.serverAuthorName}>{user?.name}</span>
        {authorIsAdmin && (
          <Image src={logo} alt={`cord icon logo`} height={16} width={16} />
        )}
        <CordTimestamp type="message" value={timestamp} />
        {isAnswer && (
          <SolutionLabel
            className={cx(styles.solutionLabel, styles.marginLeft)}
          />
        )}
      </div>
    </>
  );
}

function LoggedOutComposer({ postID }: { postID: string }) {
  return (
    <div className={styles.serverComposerContainer}>
      <Button
        behaveAs="a"
        href={`/api/auth/login?returnTo=/post/${postID}`}
        variant="outline"
      >
        Sign in to comment
      </Button>
    </div>
  );
}
