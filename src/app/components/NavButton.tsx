import cx from 'classnames';
import styles from './navButton.module.css';
import {
  DocumentTextIcon,
  CodeBracketIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

function NavItemPrefix({
  navFor,
  type,
}: {
  navFor: string;
  type?: 'resources' | 'category';
}) {
  if (navFor === 'All Topics') {
    return <HomeIcon width="14px" />;
  }
  if (type === 'resources') {
    switch (navFor) {
      case 'REST API Reference':
        return <CodeBracketIcon width={'14px'} />;
      case 'Documentation':
        return <DocumentTextIcon width={'14px'} />;
      case 'Cord Console':
        return <DocumentTextIcon width={'14px'} />;
    }
  }

  if (type === 'category') {
    return (
      <span
        className={cx(styles.categoryPrefix, {
          [styles.colorOrange]: navFor === 'Announcements',
          [styles.colorPurple]: navFor === 'Documentation',
          [styles.colorBlue]: navFor === 'API',
          [styles.colorGreen]: navFor === 'Customization',
        })}
      ></span>
    );
  }
}

export function NavButton({
  value,
  linkTo,
  type,
}: {
  value: string;
  linkTo: string;
  type?: 'category' | 'resources';
}) {
  if (value === '') return null;
  return (
    <Link href={linkTo} className={styles.button} aria-label={value}>
      <NavItemPrefix navFor={value} type={type} />
      <span className={styles.buttonName}>{value}</span>
    </Link>
  );
}
