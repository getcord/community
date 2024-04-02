import styles from './threadsheader.module.css';
import { Category } from '@/app/types';
import Button from '../ui/Button';

export default function ThreadsHeader({
  allowDiscussion,
  category,
}: {
  allowDiscussion: boolean;
  category: Category;
}) {
  if (!allowDiscussion) {
    return <></>;
  }
  return (
    <div className={styles.container}>
      <Button
        behaveAs="a"
        href={`/newpost?category=${category}`}
        label="start a discussion"
      >
        + Start a discussion
      </Button>
    </div>
  );
}
