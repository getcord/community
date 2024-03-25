'use client';

import { useState } from 'react';
import { experimental } from '@cord-sdk/react';
import { User } from '@/app/helpers/user';
import styles from './userDetails.module.css';

interface UserDetailsProps {
  user: User;
}

type UserDetailsModalStateType = 'DETAILS_MENU' | 'UPDATE_USER';

export function UserDetails({ user }: UserDetailsProps) {
  const { userID } = user;
  const [modalState, setModalState] =
    useState<UserDetailsModalStateType | null>(null);

  const openUserDetailsMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    setModalState('DETAILS_MENU');
  };

  return (
    <>
      {userID && (
        <div onClick={openUserDetailsMenu} className={styles.avatarWrapper}>
          <experimental.Avatar
            userId={userID}
            className={styles.profileAvatar}
          />
        </div>
      )}
    </>
  );
}
