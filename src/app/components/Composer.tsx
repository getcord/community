"use client";

import { useCallback, useState } from "react";
import type { ThreadSummary } from "@cord-sdk/types";
import { EVERYONE_GROUP_ID } from "@/consts";
import { Composer as CordComposer } from "@cord-sdk/react";
import styles from "./composer.module.css";
import { redirect } from "next/navigation";
import CategorySelector from "@/app/components/CategorySelector";

export default function Composer() {
  const [title, setTitle] = useState("");

  const handleComposerOnSend = useCallback(
    ({ thread }: { thread: ThreadSummary | null }) => {
      console.log({ thread, title: thread?.firstMessage?.metadata["title"] });
      setTitle("");
      redirect("/");
      // generate a slug from the title (threadmetadata.title) and message content
      // got to that slug (or maybe refresh the page?)
    },
    []
  );

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
        <div className={styles.inputContainer}>
          <label htmlFor="titleInput" className={styles.label}>
            Message:
          </label>

          <CordComposer
            groupId={EVERYONE_GROUP_ID}
            showExpanded={true}
            onSend={handleComposerOnSend}
            size={"large"}
          />
        </div>
      </section>
    </div>
  );
}
