'use client';

import { useCallback, useEffect, useState } from 'react';
import { User } from '@/app/helpers/user';
import Button from '@/app/ui/Button';
import styles from './updateuserdetails.module.css';
import { SERVER_HOST } from '@/consts';
import Input, { Label } from '@/app/ui/Input';
import { user as CordUser } from '@cord-sdk/react';
import { ResultMessage } from '@/app/components/ResultMessage';

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sendEmailNotifications, setSendEmailNotifications] = useState(
    viewer?.notificationPreferences.sendViaEmail,
  );

  const [prevDetails, setPrevDetails] = useState<{
    userName: string;
    sendEmailNotifications: boolean;
  }>();

  useEffect(() => {
    if (viewer?.notificationPreferences) {
      setSendEmailNotifications(
        viewer.notificationPreferences.sendViaEmail || false,
      );
      setPrevDetails({
        userName: user.name ?? '',
        sendEmailNotifications:
          viewer.notificationPreferences.sendViaEmail || false,
      });
    }
  }, [user.name, viewer]);

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
        return;
      }
    }

    if (
      window.CordSDK !== undefined &&
      sendEmailNotifications !== viewer?.notificationPreferences.sendViaEmail
    ) {
      try {
        await window.CordSDK.user.setNotificationPreferences({
          sendViaEmail: sendEmailNotifications,
        });
      } catch (error) {
        if (error instanceof Error) {
          setError(
            `Unable to update email notifications preferences: ${error.message}`,
          );
          return;
        }
      }
    }
    setSuccess('Successfully updated user details');
    setPrevDetails({
      userName: userName ?? '',
      sendEmailNotifications: sendEmailNotifications || false,
    });
  }, [
    userID,
    userName,
    sendEmailNotifications,
    viewer?.notificationPreferences.sendViaEmail,
  ]);

  const onButtonClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await handleSaveUserDetails();
    },
    [handleSaveUserDetails],
  );

  return (
    <form className={styles.container}>
      <h4 className={styles.title}>Your User Details</h4>
      <Input
        id="username"
        name="username"
        onChange={(e) => setUserName(e.target.value)}
        value={userName}
        label={'User Name:'}
      />
      <Input
        id="email"
        name="email"
        placeholder={user.email}
        onChange={(e) => setUserName(e.target.value)}
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
      <div className={styles.submitMessageAndButton}>
        <ResultMessage
          successMessage={success}
          onCloseSuccesMessage={() => setSuccess(null)}
          errorMessage={error}
          onCloseErrorMessage={() => setError(null)}
        />
        <Button
          behaveAs={'button'}
          style={{ marginLeft: 'auto' }}
          onClick={onButtonClick}
          disabled={
            !prevDetails ||
            (prevDetails.userName === userName &&
              prevDetails.sendEmailNotifications === sendEmailNotifications)
          }
        >
          Save
        </Button>
      </div>
    </form>
  );
}
