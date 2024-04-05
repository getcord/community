import Post from '../../Post';
import ServerPost from '../../ServerPost';
import styles from '../../post.module.css';

import { getUser } from '@/app/helpers/user';

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
        <Post threadID={threadID} isAdmin={user.isAdmin ?? false} />
      ) : (
        // not logged in, SSR
        <ServerPost threadID={threadID} />
      )}
    </div>
  );
}
