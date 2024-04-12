import { Metadata, ResolvingMetadata } from 'next';
import { thread as threadHooks } from '@cord-sdk/react';

import Post from '../../Post';
import ServerPost from '../../ServerPost';
import styles from '../../post.module.css';

import { getUser } from '@/app/helpers/user';
import { getAdminMembersSet } from '@/app/helpers/admins';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { SERVER_HOST } from '@/consts';

type Props = {
  params: { postID: string; postSlug: string };
};

export async function generateMetadata(
  { params }: { params: { postID: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { postID } = params;

  const [threadData, messageData] = await Promise.all([
    fetchCordRESTApi(`threads/${encodeURIComponent(postID)}`, 'GET'),
    fetchCordRESTApi(
      `threads/${encodeURIComponent(postID)}/messages?sortDirection=ascending`,
    ),
  ]);

  let title = 'New Post';
  let description = '';
  if (
    threadData &&
    typeof threadData === 'object' &&
    'name' in threadData &&
    typeof threadData.name === 'string' &&
    'total' in threadData &&
    typeof threadData.total === 'number'
  ) {
    title = threadData.name;
    if (threadData.total > 1) {
      description = threadData.total + ' comments | ';
    }
  }

  if (messageData && Array.isArray(messageData) && messageData.length) {
    const msg = messageData[0];
    if (
      typeof msg === 'object' &&
      'plaintext' in msg &&
      typeof msg.plaintext === 'string' &&
      typeof msg
    ) {
      description += msg.plaintext.replace(/\n/g, ' ');
      if (description.length > 200) {
        description = description.substring(0, 197) + '...';
      }
    }
  }
  if (description === '') {
    description = 'A new post in the Cord Community forum';
  }

  const images = [SERVER_HOST + '/opengraph-image.png'];
  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      images,
    },
    twitter: {
      title,
      description,
      images,
    },
  };
}

export default async function Page({ params }: Props) {
  const threadID = decodeURIComponent(params?.postID || '');
  const user = await getUser();
  const adminMembersSet = await getAdminMembersSet();

  return (
    <div className={styles.container}>
      {user.userID ? (
        // logged in, client side rendered
        <Post
          threadID={threadID}
          isAdmin={user.isAdmin ?? false}
          adminMembersSet={adminMembersSet}
        />
      ) : (
        // not logged in, SSR
        <ServerPost threadID={threadID} />
      )}
    </div>
  );
}
