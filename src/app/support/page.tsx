'use client';

import { ThreadList, Composer, Thread } from '@cord-sdk/react';
import { useState } from 'react';
import cx from 'classnames';
import styles from './support.module.css';
import { XMarkIcon } from '@heroicons/react/24/outline';

// TODO: Maylynn will refactor this so that we're using layout (probably) so 
// that we can have the threadID in the URL

export default function Support() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  return (
    <div
      className={cx({
        [styles.container]: selectedThread === null,
        [styles.containerWithDrawer]: selectedThread !== null,
      })}
    >
      <ThreadList
        // this will be updated to have the correct location
        location={{ page: 'discord' }}
        onThreadClick={(threadId) => {
          setSelectedThread(threadId);
        }}
        style={{ gridArea: 'threads' }}
      />
      <Composer
        // this will be updated to have only the customer's group
        groupId="community_all"
        location={{ page: 'discord' }}
        style={{ gridArea: 'composer' }}
      />
      {selectedThread && (
        <ThreadDetails
          threadId={selectedThread}
          onClose={() => setSelectedThread(null)}
        />
      )}
    </div>
  );
}

function ThreadDetails({
  threadId,
  onClose,
}: {
  threadId: string;
  onClose: () => void;
}) {
  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHeader}>
        <h3>Thread</h3>
        <button aria-label="close thread details" onClick={onClose} className={styles.drawerClose}>
          <XMarkIcon width="14px"  />
        </button>
      </div>
      <Thread threadId={threadId} />
    </div>
  );
}
