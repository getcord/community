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
      <div className={styles.filters}>
        {/* 
         TODO: fetch all tags and put them in a dropdown menu button
         */}
        FILTERS WOULD APPEAR HERE
      </div>

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
