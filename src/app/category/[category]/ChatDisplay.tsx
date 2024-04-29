import styles from './chatDisplay.module.css';
import ThreadList from '@/app/components/ThreadList';
import { Category } from '@/app/types';
import { getUser } from '@/app/helpers/user';

// All channels allow discussion for logged in users except
// `announcements` which requires the user to be an admin
async function getAllowDiscussion(channelName: Category) {
  const { userID, isAdmin } = await getUser();
  if (!userID) {
    return false;
  }
  if (channelName === 'announcements') {
    return isAdmin ?? false;
  }
  return true;
}

export default async function ChatDisplay({
  channelName,
}: {
  channelName: Category;
}) {
  const allowDiscussion = await getAllowDiscussion(channelName);
  return (
    <div className={styles.container}>
      <ThreadList category={channelName} allowDiscussion={allowDiscussion} />
    </div>
  );
}
