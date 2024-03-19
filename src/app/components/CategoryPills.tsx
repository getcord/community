import { Category } from '@/app/types';
import styles from './categoryPills.module.css';
import Link from 'next/link';
import CategoryPill from './CategoryPill';

export function CategoryPills({ categories }: { categories: Category[] }) {
  return (
    <div className={styles.container}>
      {categories &&
        categories.map((category) => (
          <Link
            key={category}
            href={`/category/${category}`}
            aria-label={category}
            className={styles.link}
          >
            <CategoryPill category={category} />
          </Link>
        ))}
    </div>
  );
}
