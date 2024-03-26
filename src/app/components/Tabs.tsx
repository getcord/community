import { ResourceItem } from '@/app/components/Sidebar';
import styles from './tabs.module.css';
import Button from '@/app/ui/Button';
import cx from 'classnames';
import Link from 'next/link';

interface TabProps {
  tabs: { label: string; name: string }[];
  activeTab: string;
}

function Tabs({ tabs, activeTab }: TabProps) {
  return (
    <nav>
      <ol className={styles.tabItems}>
        {tabs.map((tab) => (
          <li
            key={tab.label}
            className={cx(styles.tab, {
              [styles.active]: activeTab === tab.label,
            })}
          >
            <Link
              role="tab"
              href={`/profile/${tab.label}`}
              aria-selected={activeTab === tab.label}
              className={styles.link}
            >
              <ResourceItem resourceType={tab.name} resourceName={tab.name} />
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Tabs;
