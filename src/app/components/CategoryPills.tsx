import { NavButton } from '@/app/components/NavButton';
import { Category } from '@/app/types';
import { mapCategoryEndpointsToTitles } from '@/utils';
import styles from './categoryPills.module.css';

export function CategoryPills({ categories }: { categories: Category[] }) {
  return (
    <div className={styles.container}>
      {categories &&
        categories.map((category) => (
          <NavButton
            key={category}
            value={mapCategoryEndpointsToTitles(category)}
            linkTo={`/category/${category}`}
            type="category"
          />
        ))}
    </div>
  );
}
