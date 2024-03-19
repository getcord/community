import cx from 'classnames';
import { Category } from '../types';
import styles from './categoryPill.module.css';
import { mapCategoryEndpointsToTitles } from '@/utils';

export default function CategoryPill({
  category,
  withIcon = true,
  withText = true,
}: {
  category: Category;
  withIcon?: boolean;
  withText?: boolean;
}) {

  return (
    <span className={styles.container}>
      {withIcon && <span className={cx(styles.icon, styles[category.toLowerCase()])} />}
      {withText && (
        <span className={styles.text}>
          {mapCategoryEndpointsToTitles(category)}
        </span>
      )}
    </span>
  );
}
