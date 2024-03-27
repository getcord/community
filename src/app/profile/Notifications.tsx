'use client';

import { NotificationList } from '@cord-sdk/react';

export default function Notifications() {
  return (
    <NotificationList
      style={{
        width: '100%',
        boxShadow: 'none',
        border: 'none',
      }}
    />
  );
}
