import {
  CoreThreadData,
  CoreMessageData,
  ClientUserData,
} from '@cord-sdk/types';
import cx from 'classnames';
import { getTypedMetadata } from '@/utils';
import {
  CordAvatar,
  CordMessageContent,
  CordTimestamp,
} from '../components/CordClient';
import { getClientUserById, getUserById } from '../helpers/user';
import { ThreadNotFound, ThreadHeading } from './Post';
import styles from './post.module.css';
import { buildQueryParams, fetchCordRESTApi } from '../fetchCordRESTApi';
import Image from 'next/image';
import Button from '../ui/Button';
import { getStructuredQAData } from '@/lib/structuredData';
import { JSONLD } from '@/lib/JSONLD';
import logo from '@/static/cord-icon.png';
import { Metadata } from '@/app/types';
import { SolutionLabel } from '@/app/components/SolutionLabel';

async function getData(
  threadID: string,
): Promise<[CoreThreadData | undefined, CoreMessageData[] | undefined]> {
  const categoryQueryParams = buildQueryParams([
    { field: 'sortDirection', value: 'ascending' },
  ]);
  return await Promise.all([
    fetchCordRESTApi<CoreThreadData>(`threads/${threadID}`),
    fetchCordRESTApi<CoreMessageData[]>(
      `threads/${threadID}/messages${categoryQueryParams}`,
    ),
  ]);
}

export default async function ServerPost({
  threadID,
  adminMembersSet,
}: {
  threadID: string;
  adminMembersSet: Set<string>;
}) {
  const [thread, messages] = await getData(threadID);

  if (!thread || !messages) {
    return <ThreadNotFound />;
  }
  const metadata = getTypedMetadata(thread.metadata);

  const structuredData = getStructuredQAData(thread, messages);

  return (
    <>
      {structuredData && <JSONLD json={structuredData} />}
      <ThreadHeading metadata={metadata} threadName={thread.name} />
      <ServerThread
        messages={messages}
        metadata={metadata}
        adminMembersSet={adminMembersSet}
      />
      <LoggedOutComposer postID={threadID} />
    </>
  );
}

function ServerThread({
  messages,
  metadata,
  adminMembersSet,
}: {
  messages: CoreMessageData[];
  metadata: Metadata;
  adminMembersSet: Set<string>;
}) {
  return (
    <div>
      {messages.map((message) => (
        <div key={message.id} className={styles.serverMessage}>
          <ServerAuthorTimestamp
            userID={message.authorID}
            timestamp={message.updatedTimestamp ?? message.createdTimestamp}
            isAnswer={metadata.answerMessageID === message.id}
            authorIsAdmin={adminMembersSet.has(message.authorID)}
          />
          <CordMessageContent
            edited={false}
            attachments={message.attachments}
            content={message.content as any}
            className={styles.serverMessageContent}
          />
          {/* TODO: reactions */}
        </div>
      ))}
    </div>
  );
}

async function ServerAuthorTimestamp({
  userID,
  timestamp,
  isAnswer,
  authorIsAdmin,
}: {
  userID: string;
  timestamp: Date;
  isAnswer: boolean;
  authorIsAdmin: boolean;
}) {
  const user = await getClientUserById(userID);

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
