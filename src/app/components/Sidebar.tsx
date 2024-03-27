'use client';

import styles from './sidebar.module.css';
import { CORD_CONSOLE_URL, CORD_DOCS_URL } from '@/consts';
import { usePathname } from 'next/navigation';
import { Category, SupportChat } from '@/app/types';
import cx from 'classnames';
import CategoryPill from './CategoryPill';
import Link from 'next/link';
import {
  BellIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { notification } from '@cord-sdk/react';

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
] as const;

export default function Sidebar({
  categories,
  supportChats,
  supportEnabled,
  isLoggedIn,
  customerExists,
}: {
  categories?: Category[];
  supportEnabled?: boolean;
  supportChats?: SupportChat[];
  isLoggedIn: boolean;
  customerExists: boolean;
}) {
  const pathname = usePathname();
  const summary = notification.useSummary();

  return (
    <nav className={styles.container}>
      <ul className={styles.navItems}>
        <li
          className={cx(styles.listItem, {
            [styles.listItemActive]: pathname === '/',
          })}
        >
          <Link href="/" aria-label="home" className={styles.link}>
            <ResourceItem resourceType="All Topics" />
          </Link>
        </li>
        {isLoggedIn && (
          <li
            className={cx(styles.listItem, {
              [styles.listItemActive]: pathname === '/notifications',
            })}
          >
            <Link
              href="/notifications"
              aria-label="Notifications"
              className={styles.link}
            >
              <ResourceItem
                resourceType="Notifications"
                hasActivityBadge={!!summary?.unread}
              />
            </Link>
          </li>
        )}
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
                  <ResourceItem resourceType={resource.id} />
                </Link>
              </li>
            ))}
          </ul>
        </li>
        {!isLoggedIn ? null : (
          <>
            <h4 className={styles.navlistTitle}>Support chat</h4>
            <ul className={styles.navItems}>
              {!customerExists && (
                <Button
                  behaveAs="a"
                  href="https://console.cord.com/settings/billing"
                  label="upgrade Cord account"
                  style={{ marginLeft: '20px' }}
                >
                  Set up Cord
                </Button>
              )}
              {customerExists && !supportEnabled && (
                <Button
                  behaveAs="a"
                  href="https://console.cord.com/settings/billing"
                  label="upgrade Cord account"
                  style={{ marginLeft: '20px' }}
                >
                  Upgrade Cord
                </Button>
              )}
              {supportEnabled &&
                supportChats?.map(({ customerID, customerName }) => (
                  <li className={styles.listItem} key={customerID}>
                    <Link
                      href="/support"
                      aria-label={`support for ${customerName}`}
                      className={styles.link}
                    >
                      <ResourceItem
                        resourceType="Support"
                        resourceName={customerName}
                      />
                    </Link>
                  </li>
                ))}
            </ul>
          </>
        )}
      </ul>
    </nav>
  );
}

export function ResourceItem({
  resourceType,
  resourceName,
  hasActivityBadge,
}: {
  resourceType: string;
  resourceName?: string;
  hasActivityBadge?: boolean;
}) {
  return (
    <span className={styles.resourceContainer}>
      <NavItemPrefix navFor={resourceType} />
      <span>{resourceName ?? resourceType}</span>
      {hasActivityBadge && <span className={cx(styles.activityBadge)} />}
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
    case 'Cord Console':
      return <DocumentTextIcon width={'14px'} />;
    case 'Support':
      return <ChatBubbleLeftRightIcon width={'14px'} />;
    case 'Notifications':
      return <BellIcon width={'14px'} />;
    case 'Profile':
      return <UserIcon width={'14px'} />;
    case 'Preferences':
      return <Cog6ToothIcon width={'14px'} />;
  }
}
