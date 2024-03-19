import styles from './navButton.module.css';
import {
  DocumentTextIcon,
  CodeBracketIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import CategoryPill from './CategoryPill';
import { Category } from '../types';
import { isCategory } from '@/utils';

function NavItemPrefix({ navFor }: { navFor: string }) {
  switch (navFor) {
    case 'All Topics':
      return <HomeIcon width={'14px'} />;
    case 'REST API Reference':
      return <CodeBracketIcon width={'14px'} />;
    case 'Docs':
      return <DocumentTextIcon width={'14px'} />;
    case 'Cord Console':
      return <DocumentTextIcon width={'14px'} />;
  }
}

export function NavButton({
  value,
  linkTo,
}: {
  value: string;
  linkTo: string;
}) {
  if (value === '') return null;
  return (
    <Link href={linkTo} className={styles.button} aria-label={value}>
      {isCategory(value) ? (
        <CategoryPill category={value as Category} />
      ) : (
        <>
          <NavItemPrefix navFor={value} />
          <span className={styles.buttonName}>{value}</span>
        </>
      )}
    </Link>
  );
}
