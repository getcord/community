import { CoreThreadData, CoreMessageData } from '@cord-sdk/types';
import { getTypedMetadata } from '@/utils';
import { CordMessageContent, CordTimestamp } from '../components/CordClient';
import { getUserById } from '../helpers/user';
import { ThreadNotFound, ThreadHeading } from './Post';
import styles from './post.module.css';
import { buildQueryParams, fetchCordRESTApi } from '../fetchCordRESTApi';
import Image from 'next/image';
import Button from '../ui/Button';

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

  return (
    <>
      <ThreadHeading metadata={metadata} threadName={thread.name} />
      <ServerThread messages={messages} />
      <LoggedOutComposer postID={threadID} />
    </>
  );
}

function ServerThread({ messages }: { messages: CoreMessageData[] }) {
  return (
    <div>
      {messages.map((message) => (
        <div key={message.id} className={styles.serverMessage}>
          <ServerAuthorTimestamp
            userID={message.authorID}
            timestamp={message.updatedTimestamp ?? message.createdTimestamp}
          />
          <CordMessageContent
            edited={false}
            attachments={[]}
            content={message.content as any}
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
}: {
  userID: string;
  timestamp: Date;
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
        <CordTimestamp type="message" value={timestamp} />
      </div>
    </>
  );
}

function LoggedOutComposer({ postID }: { postID: string }) {
  return (
    <div className={styles.serverComposerContainer}>
      <p>
        To interact with this post at all you&apos;ll have to log in to Cord.
        Or, if you&apos;re already a Cord customer then sign as your{' '}
        <a href="https://console.cord.com" aria-label="cord console">
          console
        </a>{' '}
        user and you&apos;re ready to go!
      </p>
      <div className={styles.serverComposerButtons}>
        <Button
          behaveAs="a"
          href={`/api/auth/login?returnTo=/post/${postID}`}
          variant="outline"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
