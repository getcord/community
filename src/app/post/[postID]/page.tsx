import { getAdminMembersSet } from '@/app/helpers/admins';
import Post from '../Post';
import ServerPost from '../ServerPost';
import styles from '../post.module.css';

import { getUser } from '@/app/helpers/user';

export default async function Page({
  params,
}: {
  params?: { postID: string };
}) {
  const threadID = decodeURIComponent(params?.postID || '');
  const user = await getUser();
  const adminMembersSet = await getAdminMembersSet();

  return (
    <div className={styles.container}>
      {user.userID ? (
        // logged in, client side rendered
        <Post
          threadID={threadID}
          user={user}
          adminMembersSet={adminMembersSet}
        />
      ) : (
        // not logged in, SSR
        <ServerPost threadID={threadID} adminMembersSet={adminMembersSet} />
      )}
    </div>
  );
}
