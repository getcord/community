"use client";
import { ComponentProps, useCallback, useState } from "react";
import type { ThreadSummary } from "@cord-sdk/types";
import { Composer as CordComposer } from "@cord-sdk/react";
import styles from "./composer.module.css";

interface Props extends ComponentProps<typeof CordComposer> {}

export default function Composer(props: Props) {
  const [title, setTitle] = useState("");

  // Fix type
  const handleComposerOnSend = useCallback(
    ({ thread }: { thread: ThreadSummary | null }) => {
      console.log({ thread, title: thread?.firstMessage?.metadata["title"] });
      // close the composer,
      // generate a slug from the title (threadmetadata.title) and message content
      // got to that slug (or maybe refresh the page?)
    },
    []
  );

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <label htmlFor="titleInput" className={styles.label}>
          Title:
        </label>
        <input
          className={styles.input}
          id="titleInput"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <CordComposer
        style={{ width: "100%", display: "block" }}
        {...props}
        threadMetadata={{ ...props.threadMetadata, title }}
        onSend={handleComposerOnSend}
        showExpanded={true}
      />

      {/* <button className={styles.submitButton}>
        CAN THIS BUTTON BE THE DEFAULT SUBMIT BUTTON?
      </button> */}
    </div>
  );
}
