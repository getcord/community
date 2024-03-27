import { CoreThreadData, CoreMessageData } from '@cord-sdk/types';
import styles from '../post.module.css';
import { getTypedMetadata } from '@/utils';

import { buildQueryParams, fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import Post, { ThreadHeading, ThreadNotFound } from './Post';
import { getUser, getUserById } from '@/app/helpers/user';
import Image from 'next/image';

async function getData(
  threadID: string,
): Promise<[CoreThreadData, CoreMessageData[]] | undefined> {
  try {
    const categoryQueryParams = buildQueryParams([
      { field: 'sortDirection', value: 'ascending' },
    ]);
    return await Promise.all([
      fetchCordRESTApi<CoreThreadData>(`threads/${threadID}`),
      fetchCordRESTApi<CoreMessageData[]>(
        `threads/${threadID}/messages${categoryQueryParams}`,
      ),
    ]);
  } catch (error) {
    console.error(error);
  }
}

export default async function Page({
  params,
}: {
  params?: { postID: string };
}) {
  const threadID = decodeURIComponent(params?.postID || '');
  const user = await getUser();

  return (
    <div className={styles.container}>
      {user.userID ? (
        // logged in, client side rendered
        <Post threadID={threadID} />
      ) : (
        // not logged in, SSR
        <ServerPost threadID={threadID} />
      )}
    </div>
  );
}

async function ServerPost({ threadID }: { threadID: string }) {
  const result = await getData(threadID);
  if (!result) {
    return <ThreadNotFound />;
  }
  const [thread, messages] = result;
  const metadata = getTypedMetadata(thread.metadata);

  return (
    <>
      <ThreadHeading metadata={metadata} threadName={thread.name} />
      <ServerThread messages={messages} />
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
          <p className={styles.serverMessageContent}>{message.plaintext}</p>
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
  const date = new Date(timestamp);

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
        <span className={styles.serverTimestamp}>
          {date.toLocaleDateString()}
        </span>
      </div>
    </>
  );
}
