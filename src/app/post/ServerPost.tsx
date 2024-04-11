import { CoreThreadData, CoreMessageData } from '@cord-sdk/types';
import cx from 'classnames';
import { getTypedMetadata } from '@/utils';
import { CordMessageContent, CordTimestamp } from '../components/CordClient';
import { getUserById } from '../helpers/user';
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

export default async function ServerPost({ threadID }: { threadID: string }) {
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
      <ServerThread messages={messages} metadata={metadata} />
      <LoggedOutComposer postID={threadID} />
    </>
  );
}

function ServerThread({
  messages,
  metadata,
}: {
  messages: CoreMessageData[];
  metadata: Metadata;
}) {
  return (
    <div>
      {messages.map((message) => (
        <div key={message.id} className={styles.serverMessage}>
          <ServerAuthorTimestamp
            userID={message.authorID}
            timestamp={message.updatedTimestamp ?? message.createdTimestamp}
            isAnswer={metadata.answerMessageID === message.id}
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
}: {
  userID: string;
  timestamp: Date;
  isAnswer: boolean;
}) {
  const user = await getUserById(userID);

  if (!user.profilePictureURL) {
    // TODO: don't think this should happen? But should probably have a catch here
    return null;
  }
  return (
    <>
      <Image
        src={user.profilePictureURL}
        alt={`${user.name} profile picture`}
        width={20}
        height={20}
        className={styles.serverAvatar}
      />

      <div className={styles.serverNameAndTimestamp}>
        <span className={styles.serverAuthorName}>{user.name}</span>
        {user.isAdmin && (
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
