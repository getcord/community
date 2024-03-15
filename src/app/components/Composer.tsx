"use client";

import { useCallback, useContext, useState } from "react";
import type { ClientMessageData } from "@cord-sdk/types";
import { experimental } from "@cord-sdk/react";
import styles from "./composer.module.css";
import CategorySelector from "@/app/components/CategorySelector";
import {
  ComposerLayoutProps,
  ComposerProps,
  SendButtonProps,
} from "@cord-sdk/react/dist/mjs/types/experimental";
import { NewPostInputContext } from "@/app/contexts/newPostInputContext";

function DatCordComposer(props: ComposerProps) {
  const { setTitle, setCategory, title } = useContext(NewPostInputContext);

  const datCordOnSubmit = useCallback(
    ({ message }: { message: Partial<ClientMessageData> }) => {
      if (!title || !message) {
        return;
      }

      props.onSubmit({ message });
    },
    [title, props]
  );

  return (
    <>
      <h3>Start a new discussion</h3>
      <section className={styles.inputsContainer}>
        <div className={styles.inputContainer}>
          <CategorySelector
            permissions="READ_WRITE"
            label={"Please select a category"}
            onChange={(event) => setCategory(event.target.value)}
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
          <experimental.CordComposer
            {...props}
            onSubmit={(message) => {
              datCordOnSubmit(message);
            }}
            onKeyDown={({ event }: { event: React.KeyboardEvent }) => {
              if (event.key === "Enter") {
                return;
              }
              props.onKeyDown({ event });
            }}
            onResetState={() => {
              if (!title) {
                return;
              }
              setTitle("");
              props.onResetState();
            }}
          />
        </div>
      </section>
    </>
  );
}

function CommunityComposerLayout(props: ComposerLayoutProps) {
  const sendButton = props.toolbarItems?.find(
    (item) => item.name === "sendButton"
  );

  return (
    <>
      <experimental.ComposerLayout
        toolbarItems={props.toolbarItems?.filter(
          (item) => item.name !== "sendButton"
        )}
        textEditor={props.textEditor}
      ></experimental.ComposerLayout>

      {sendButton?.element}
    </>
  );
}

function DatCordSendButton(props: SendButtonProps) {
  return (
    <button onClick={props.onClick} className={styles.submitButton}>
      Submit
    </button>
  );
}

export default function Composer() {
  const { title, category } = useContext(NewPostInputContext);

  return (
    <div className={styles.container}>
      <experimental.Replace
        replace={{
          ComposerLayout: CommunityComposerLayout,
          Composer: DatCordComposer,
          SendButton: DatCordSendButton,
        }}
      >
        <experimental.SendComposer
          createThread={{
            groupID: "samplecord",
            location: { page: "posts" },
            name: title,
            metadata: { category },
            // FIX: error sating window is not defined (this is due to next js client side
            // components being server-side rendered first, then hydrated )
            url: window.location.href,
          }}
        />
      </experimental.Replace>
    </div>
  );
}
