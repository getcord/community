"use client";

import React, { useEffect, useState } from "react";
import styles from "./categoryselector.module.css";
import { mapCategoryEndpointsToTitles } from "@/utils";

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
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const url = new URL("http://localhost:3000/api/categories");
        url.searchParams.append("permissions", permissions);

        const response = await fetch(url.href, {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const writecategories = (await response.json()).data;
        const newcategories: string[] = writecategories.map((cat: string) =>
          mapCategoryEndpointsToTitles(cat)
        );
        setCategories(newcategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
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
            {option}
          </option>
        ))}
      </select>
    </>
  );
};

export default CategorySelector;
