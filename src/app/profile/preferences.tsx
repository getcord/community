'use client';

import { useCallback, useState } from 'react';
import { User } from '@/app/helpers/user';
import Button from '@/app/ui/Button';
import styles from './preferences.module.css';
import { SERVER_HOST } from '@/consts';
import Input, { Label } from '@/app/ui/Input';
import { useRouter } from 'next/navigation';

interface UserDetailsProps {
  user: User;
}

export default function Preferences({ user }: UserDetailsProps) {
  const { userID } = user;
  const router = useRouter();

  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [sendEmailNotifications, setSendEmailNotifications] = useState(false);

  const handleSaveUserDetails = useCallback(async () => {
    if (!userID || !userName) {
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

    if (window.CordSDK !== undefined) {
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

    router.push('/profile/preferences');
  }, [sendEmailNotifications, userID, userName, router]);

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
      <Input
        id="username"
        name="username"
        placeholder={user.name}
        onChange={(e) => setUserName(e.target.value)}
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
          // TODO: this should be the value of their current
          // preference
          checked={sendEmailNotifications}
          onChange={() => setSendEmailNotifications(!sendEmailNotifications)}
          aria-label="Toggle email notifications"
        />
      </div>
      <span className={styles.error}>{error}</span>
      <Button
        displayAs={'button'}
        style={{ justifySelf: 'right' }}
        onClick={handleSaveUserDetails}
      >
        Save
      </Button>
    </div>
  );
}
