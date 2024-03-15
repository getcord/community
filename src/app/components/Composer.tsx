"use client";

import { useState } from "react";
import { experimental } from "@cord-sdk/react";
import styles from "./composer.module.css";
import CategorySelector from "@/app/components/CategorySelector";

export default function Composer() {
  const [title, setTitle] = useState("");

  return (
    <div className={styles.container}>
      <h3>Start a new discussion</h3>
      <section className={styles.inputsContainer}>
        <div className={styles.inputContainer}>
          <CategorySelector
            permissions="READ_WRITE"
            label={"Please select a category"}
            onChange={() => {
              console.log("ON CHANGE");
            }}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="titleInput" className={styles.label}>
            Title:
          </label>
          <textarea
            className={styles.input}
            id="titleInput"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
      </section>
      <div className={styles.inputContainer}>
        <label htmlFor="titleInput" className={styles.label}>
          Message:
        </label>
        <experimental.Replace>
          <experimental.SendComposer
            createThread={{
              groupID: "samplecord",
              location: { page: "posts" },
              name: title,
              url: window.location.href,
            }}
          />
        </experimental.Replace>
      </div>
    </div>
  );
}
