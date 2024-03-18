import Link from 'next/link';
import styles from './threadsheader.module.css';
import cx from 'classnames';
import { Category } from '@/app/types';

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
        <Link
          href={`/newpost?category=${category}`}
          aria-label="start a discussion"
          className={cx(styles.actionButton, {
            [styles.disabled]: permissions === 'READ',
          })}
        >
          + Start a discussion
        </Link>
      )}
    </div>
  );
}
