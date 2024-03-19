'use client';

import styles from './sidebar.module.css';
import { CORD_CONSOLE_URL, CORD_DOCS_URL } from '@/consts';
import { usePathname } from 'next/navigation';
import { Category } from '@/app/types';
import cx from 'classnames';
import CategoryPill from './CategoryPill';
import Link from 'next/link';
import {
  CodeBracketIcon,
  DocumentTextIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

const resources = [
  {
    id: 'Docs',
    linkTo: `${CORD_DOCS_URL}`,
  },
  {
    id: 'REST API Reference',
    linkTo: `${CORD_DOCS_URL}/rest-apis`,
  },
  {
    id: 'Cord Console',
    linkTo: `${CORD_CONSOLE_URL}`,
  },
];

export default function Sidebar({ categories }: { categories?: Category[] }) {
  const pathname = usePathname();

  return (
    <nav className={styles.container}>
      <ul className={styles.navItems}>
        <li
          className={cx(styles.listItem, {
            [styles.listItemActive]: pathname === '/',
          })}
        >
          <Link href="/" aria-label="home" className={styles.link}>
            <ResourceItem resourceName="All Topics" />
          </Link>
        </li>
        {categories && (
          <li>
            <h4 className={styles.navlistTitle}>Categories</h4>
            <ul className={styles.navItems}>
              {categories.map((category) => (
                <li
                  key={category}
                  className={cx(styles.listItem, {
                    [styles.listItemActive]:
                      pathname === `/category/${category}`,
                  })}
                >
                  <Link
                    className={styles.link}
                    href={`/category/${category}`}
                    aria-label={category}
                  >
                    <CategoryPill category={category as Category} />
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        )}
        <li>
          <h4 className={styles.navlistTitle}>Resources</h4>
          <ul className={styles.navItems}>
            {resources.map((resource) => (
              <li key={resource.id} className={styles.listItem}>
                <Link
                  href={resource.linkTo}
                  aria-label={resource.id}
                  className={styles.link}
                >
                  <ResourceItem resourceName={resource.id} />
                </Link>
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  );
}

export function ResourceItem({ resourceName }: { resourceName: string }) {
  return (
    <span className={styles.resourceContainer}>
      <NavItemPrefix navFor={resourceName} />
      <span>{resourceName}</span>
    </span>
  );
}

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
