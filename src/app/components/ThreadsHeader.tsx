import styles from './threadsheader.module.css';
import { Category } from '@/app/types';
import Button from '../ui/Button';

export default function ThreadsHeader({
  permissions,
  category,
}: {
  permissions: string;
  category: Category;
}) {
  return (
    <div className={styles.container}>
      {permissions !== 'NOT_VISIBLE' && (
        <Button
          displayAs="link"
          href={`/newpost?category=${category}`}
          label="start a discussion"
          disabled={permissions === 'READ'}
        >
          + Start a discussion
        </Button>
      )}
    </div>
  );
}
