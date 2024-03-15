"use client";

import React, { useState } from "react";
import styles from "./categoryselector.module.css";

const CategorySelector = ({
  label,
  onChange,
  permissions,
}: {
  label: string;
  onChange: () => void;
  permissions: "READ" | "READ_WRITE";
}) => {
  const [categories, setCategories] = useState<string[]>([]);

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
            {option}
          </option>
        ))}
      </select>
    </>
  );
};

export default CategorySelector;
