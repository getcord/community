'use client';

import { User } from '@/app/helpers/user';
import Button from '@/app/ui/Button';
import styles from './preferences.module.css';
import { useCallback, useState } from 'react';
import Divider from '@/app/ui/Divider';
import { SERVER_HOST } from '@/consts';

interface UserDetailsProps {
  user: User;
}

export default function Preferences({ user }: UserDetailsProps) {
  const { userID } = user;

  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const handleUpdateUserName = useCallback(async () => {
    if (!userID || !userName) {
      return;
    }
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
  }, [userID, userName]);

  const handleKeyUp = useCallback(
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        await handleUpdateUserName();
      }
    },
    [handleUpdateUserName],
  );

  return (
    <div className={styles.container}>
      <div>
        <h2 className={styles.modalContentTitle}>Update User Details</h2>
        <Divider />
      </div>

      <div className={styles.modalContent}>
        <div className={styles.inputContainer}>
          <label htmlFor="username" className={styles.label}>
            User Name:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder={user.name}
            onChange={(e) => setUserName(e.target.value)}
            required
            className={styles.input}
            onKeyUp={handleKeyUp}
          />
          <span className={styles.error}>{error}</span>
        </div>

        <Button
          displayAs="button"
          onClick={handleUpdateUserName}
          style={{ justifySelf: 'end' }}
          disabled={userName === ''}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
