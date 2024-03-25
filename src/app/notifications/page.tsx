'use client';

import { NotificationList } from '@cord-sdk/react';

export default function Notifications() {
  return (
    <NotificationList
      style={{
        border: 'none',
        width: '100%',
        boxShadow: 'none',
      }}
    />
  );
}
