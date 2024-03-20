'use client';

import { ThreadList, Composer } from '@cord-sdk/react';
import { useRouter } from 'next/navigation';
import styles from './support.module.css';

export default function Support() {
  const router = useRouter();

  return (
    <div className={styles.threads}>
      <ThreadList
        // this will be updated to have the correct location
        location={{ page: 'discord' }}
        onThreadClick={(threadId) => {
          router.push(`support/${threadId}`);
        }}
      />
      <Composer
        // this will be updated to have only the customer's group
        groupId="community_all"
        location={{ page: 'discord' }}
      />
    </div>
  );
}


