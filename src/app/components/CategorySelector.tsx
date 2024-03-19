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
  id,
}: {
  category: Category;
  selected: boolean;
  onChange: (category: Category) => void;
  id: string;
}) {
  const pillID = `${id}-${category}`;

  return (
    <label
      htmlFor={pillID}
      className={cx(styles.categoryPill, styles[category], {
        [styles.selected]: selected,
      })}
    >
      <input
        type="checkbox"
        name="category"
        id={pillID}
        checked={selected}
        onChange={() => onChange(category)}
      />
      {mapCategoryEndpointsToTitles(category)}
    </label>
  );
}

export default function CategorySelector({
  categories,
  selectedValues,
  onSelectedValuesChange,
  id,
}: {
  categories: Category[];
  selectedValues: Category[];
  onSelectedValuesChange: (selectedValues: Category[]) => void;
  id: string;
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
            id={id}
            category={category}
            selected={selectedValues.includes(category)}
            onChange={handleSelectionChange}
          />
        ))}
    </div>
  );
}
