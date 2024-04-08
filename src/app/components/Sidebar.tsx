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
  ClipboardDocumentListIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import { notification } from '@cord-sdk/react';
import Image from 'next/image';
import classNames from 'classnames';

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
  {
    id: 'Changelog',
    linkTo: `${CORD_DOCS_URL}/reference/changelog`,
  },
] as const;

export default function Sidebar({
  categories,
  supportChats,
  supportEnabled,
  isLoggedIn,
  customerExists,
  navOpen,
  onToggle,
}: {
  categories?: Category[];
  supportEnabled?: boolean;
  supportChats?: SupportChat[];
  isLoggedIn: boolean;
  customerExists: boolean;
  navOpen: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const summary = notification.useSummary();

  return (
    <nav
      className={classNames({
        [styles.container]: true,
        [styles.collapsed]: !navOpen,
      })}
    >
      <div className={styles.menuToggle}>
        <button onClick={onToggle} className={styles.menuToggleButton}>
          {navOpen ? (
            <>
              <Image
                src="/arrow-left.svg"
                width={14}
                height={14}
                alt="Arrow pointed left"
              />
              <span>Hide menu</span>
            </>
          ) : (
            <Image
              src="/hamburger.svg"
              width={14}
              height={14}
              alt="Menu icon"
            />
          )}
        </button>
      </div>
      <ul className={classNames(styles.navItems)}>
        <li
          className={cx(styles.listItem, {
            [styles.listItemActive]: pathname === '/',
          })}
        >
          <Link href="/" aria-label="home" className={styles.link}>
            <ResourceItem resourceType="All Posts" navOpen={navOpen} />
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
                navOpen={navOpen}
              />
            </Link>
          </li>
        )}
      </ul>
      <ul
        className={classNames({
          [styles.navItems]: true,
          [styles.categories]: true,
          [styles.collapsed]: !navOpen,
        })}
      >
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
      </ul>
      <ul className={classNames(styles.navItems)}>
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
                  <ResourceItem resourceType={resource.id} navOpen={navOpen} />
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
                  style={{ marginLeft: '20px' }}
                >
                  Set up Cord
                </Button>
              )}
              {customerExists && !supportEnabled && (
                <Button
                  behaveAs="a"
                  href="https://console.cord.com/settings/billing"
                  style={{ marginLeft: '20px' }}
                >
                  Upgrade Cord
                </Button>
              )}
              {supportEnabled &&
                supportChats?.map(({ customerID, customerName }) => (
                  <li className={styles.listItem} key={customerID}>
                    <Link
                      href={`/support/${customerID}`}
                      aria-label={`support for ${customerName}`}
                      className={styles.link}
                    >
                      <ResourceItem
                        resourceType="Support"
                        resourceName={customerName}
                        navOpen={navOpen}
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
  navOpen,
}: {
  resourceType: string;
  resourceName?: string;
  hasActivityBadge?: boolean;
  navOpen: boolean;
}) {
  return (
    <span className={styles.resourceContainer}>
      <NavItemPrefix navFor={resourceType} />
      <span
        className={classNames({
          [styles.label]: true,
          [styles.collapsed]: !navOpen,
        })}
      >
        {resourceName ?? resourceType}
      </span>
      {hasActivityBadge && <span className={cx(styles.activityBadge)} />}
    </span>
  );
}

function NavItemPrefix({ navFor }: { navFor: string }) {
  switch (navFor) {
    case 'All Posts':
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
    case 'Changelog':
      return <ClipboardDocumentListIcon width={'14px'} />;
  }
}
