import Link from 'next/link';
import styles from './threadsheader.module.css';
import cx from 'classnames';

export default function ThreadsHeader({
  permissions,
}: {
  permissions: string;
}) {
  return (
    <div className={styles.container}>
      {permissions !== 'NOT_VISIBLE' && (
        <Link
          href="/newpost"
          aria-label="start a discussion"
          className={cx(styles.actionButton, {
            [styles.disabled]: permissions === 'READ',
          })}
        >+ Start a discussion</Link>
      )}
    </div>
  );
}
