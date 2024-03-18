'use client';

import styles from './sidebar.module.css';
import { CORD_CONSOLE_URL, CORD_DOCS_URL } from '@/consts';
import { NavButton } from '@/app/components/NavButton';
import { mapCategoryEndpointsToTitles } from '@/utils';
import { usePathname } from 'next/navigation';
import { Category } from '@/app/types';
import cx from 'classnames';

const resources = [
  {
    id: 'Documentation',
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
          <NavButton value={'All Topics'} linkTo={`/`} />
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
                  <NavButton
                    value={mapCategoryEndpointsToTitles(category)}
                    linkTo={`/category/${category}`}
                    type="category"
                  />
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
                <NavButton
                  value={resource.id}
                  linkTo={resource.linkTo}
                  type="resources"
                />
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  );
}
