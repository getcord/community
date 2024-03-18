'use client';

import React, { useCallback } from 'react';
import cx from 'classnames';
import styles from './categoryselector.module.css';
import { mapCategoryEndpointsToTitles } from '@/utils';
import { Category } from '@/app/types';

function CategoryPill({
  category,
  selected,
  onChange,
}: {
  category: Category;
  selected: boolean;
  onChange: (category: Category) => void;
}) {
  return (
    <span
      className={cx(styles.categoryPill, {
        [styles.colorOrange]: category === 'announcements',
        [styles.colorPurple]: category === 'documentation',
        [styles.colorBlue]: category === 'api',
        [styles.colorGreen]: category === 'customization',
        [styles.colorLightGreen]: category === 'components',
        [styles.selected]: selected,
      })}
      onClick={() => onChange(category)}
    >
      {mapCategoryEndpointsToTitles(category)}
    </span>
  );
}

export default function CategorySelector({
  categories,
  selectedValues,
  onSelectedValuesChange,
}: {
  categories: Category[];
  selectedValues: Category[];
  onSelectedValuesChange: (selectedValues: Category[]) => void;
}) {
  const handleSelectionChange = useCallback(
    (category: Category) => {
      if (selectedValues.includes(category)) {
        onSelectedValuesChange(
          selectedValues.filter((value) => value !== category),
        );
      } else {
        onSelectedValuesChange([...selectedValues, category]);
      }
    },
    [selectedValues, onSelectedValuesChange],
  );

  return (
    <div className={styles.container}>
      {categories &&
        categories.map((category) => (
          <CategoryPill
            key={category}
            category={category}
            selected={selectedValues.includes(category)}
            onChange={handleSelectionChange}
          />
        ))}
    </div>
  );
}
