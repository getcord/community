'use client';

import React, { useEffect, useState } from 'react';
import styles from './categoryselector.module.css';
import { mapCategoryEndpointsToTitles } from '@/utils';

export default function CategorySelector({
  label,
  onChange,
  permissions,
}: {
  label: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  permissions: 'READ' | 'READ_WRITE';
}) {
  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const url = new URL('http://localhost:3000/api/categories');
        url.searchParams.append('permissions', permissions);

        const response = await fetch(url.href, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        setCategories((await response.json()).data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [permissions]);

  return (
    <>
      <label className={styles.label} htmlFor="category">
        {label}
      </label>
      <select
        className={styles.select}
        name="category"
        id="category"
        onChange={onChange}
      >
        <option value="">--Please choose an option--</option>
        {categories.map((option) => (
          <option key={option} value={option}>
            {mapCategoryEndpointsToTitles(option)}
          </option>
        ))}
      </select>
    </>
  );
}
