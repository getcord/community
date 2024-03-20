'use client';

import { Thread } from "@cord-sdk/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import styles from './threadDetails.module.css'
import { useRouter } from "next/navigation";

export default function ThreadDetails({
  params,
}: {
  params?: { threadId: string };
}) {
  const threadId = params?.threadId;
  const router = useRouter();
  if (!threadId) {
    return <h1>oops can&apos;t find this thread!</h1>
  }

  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHeader}>
        <h3>Thread</h3>
        <button
          aria-label="close thread details"
          onClick={() => router.push('/support')}
          className={styles.drawerClose}
        >
          <XMarkIcon width="14px" />
        </button>
      </div>
      <Thread threadId={threadId} />
    </div>
  );
}