import { Metadata } from 'next';
import Post from '../../Post';
import ServerPost from '../../ServerPost';
import styles from '../../post.module.css';

import { getUser } from '@/app/helpers/user';
import { getAdminMembersSet } from '@/app/helpers/admins';

type Props = {
  params: { postID: string; postSlug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = params?.postSlug.split('-').join(' ');

  return {
    title: `${title} | Cord Community`,
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
