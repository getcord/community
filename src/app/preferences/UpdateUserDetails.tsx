'use client';

import { useCallback, useEffect, useState } from 'react';
import { User } from '@/app/helpers/user';
import Button from '@/app/ui/Button';
import styles from './updateuserdetails.module.css';
import { SERVER_HOST } from '@/consts';
import Input, { Label } from '@/app/ui/Input';
import { user as CordUser } from '@cord-sdk/react';

interface UpdateUserDetailsProps {
  user: User;
}

export default function UpdateUserDetails({ user }: UpdateUserDetailsProps) {
  const { userID } = user;
  // We need the viewer data to get the notifications preferences
  // and the user prop to get the email address as we don't have that
  // info on any user client-side api
  const viewer = CordUser.useViewerData();

  const [userName, setUserName] = useState(user.name);
  const [error, setError] = useState('');
  const [sendEmailNotifications, setSendEmailNotifications] = useState(
    viewer?.notificationPreferences.sendViaEmail,
  );

  useEffect(() => {
    if (viewer?.notificationPreferences) {
      setSendEmailNotifications(
        viewer.notificationPreferences.sendViaEmail || false,
      );
    }
  }, [viewer]);

  const handleSaveUserDetails = useCallback(async () => {
    if (!userID) {
      return;
    }

    if (userName) {
      const res = await fetch(`${SERVER_HOST}/api/user?userID=${userID}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: userName,
        }),
      });

      const response = await res.json();
      if (!response.success) {
        setError(`Unable to update name: ${response.error}`);
      }
    }

    if (
      window.CordSDK !== undefined &&
      sendEmailNotifications !== viewer?.notificationPreferences.sendViaEmail
    ) {
      window.CordSDK.user
        .setNotificationPreferences({
          sendViaEmail: sendEmailNotifications,
        })
        .catch((error) => {
          setError(
            `Unable to update email notifications preferences: ${error?.message}`,
          );
        });
    }
  }, [userID, userName, viewer, sendEmailNotifications]);

  const handleKeyUp = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        await handleSaveUserDetails();
      }
    },
    [handleSaveUserDetails],
  );

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Your User Details</h4>
      <Input
        id="username"
        name="username"
        onChange={(e) => setUserName(e.target.value)}
        value={userName}
        onKeyUp={handleKeyUp}
        label={'User Name:'}
      />
      <Input
        id="email"
        name="email"
        placeholder={user.email}
        onChange={(e) => setUserName(e.target.value)}
        onKeyUp={handleKeyUp}
        label={'Email Address:'}
        disabled
      />
      <div className={styles.toggleContainer}>
        <Label htmlFor="toggleEmailNotifications">
          Send Email Notifications
        </Label>
        <input
          type="checkbox"
          id="toggleEmailNotifications"
          checked={sendEmailNotifications ?? false}
          onChange={() => setSendEmailNotifications(!sendEmailNotifications)}
          aria-label="Toggle email notifications"
        />
      </div>
      <span className={styles.error}>{error}</span>
      <Button
        behaveAs={'button'}
        style={{ justifySelf: 'right' }}
        onClick={handleSaveUserDetails}
      >
        Save
      </Button>
    </div>
  );
}
