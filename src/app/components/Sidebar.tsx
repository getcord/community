import styles from './sidebar.module.css';
import type { ServerUserData } from '@cord-sdk/types';
import { CORD_CONSOLE_URL, CORD_DOCS_URL } from '@/consts';
import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { NavButton } from '@/app/components/NavButton';
import { mapCategoryEndpointsToTitles } from '@/utils';

export type Category = {
  id: string;
  // whether they can create a new thread within this category or not
  // eg announcements should only be available to community_admins
  permission: string;
  group: string | null;
};

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

async function getAllCategories() {
  try {
    const allCategories = (
      await fetchCordRESTApi<ServerUserData>('users/all_categories_holder')
    ).metadata as Record<string, string>;
    return Object.keys(allCategories);
  } catch (error) {
    console.error(error);
  }
}

export default async function Sidebar() {
  const categories = await getAllCategories();
  // TODO: styling and functionality
  return (
    <div className={styles.container}>
      <section className={styles.scrollableContainer}>
        <ul className={styles.navItems}>
          <li className={styles.listItem}>
            <NavButton isActive={false} value={'All Topics'} linkTo={`/`} />
          </li>
        </ul>
        {categories && (
          <section className={styles.navlistContainer}>
            <span className={styles.navlistTitle}>Categories</span>
            <ul className={styles.navItems}>
              {categories.map((category) => (
                <li key={category} className={styles.listItem}>
                  <NavButton
                    isActive={false}
                    value={mapCategoryEndpointsToTitles(category)}
                    linkTo={`/category/${category}`}
                    type="category"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className={styles.navlistContainer}>
          <span className={styles.navlistTitle}>Resources</span>
          <ul className={styles.navItems}>
            {resources.map((resource) => (
              <li key={resource.id} className={styles.listItem}>
                <NavButton
                  isActive={false}
                  value={resource.id}
                  linkTo={resource.linkTo}
                  type="resources"
                />
              </li>
            ))}
          </ul>
        </section>
      </section>
    </div>
  );
}
