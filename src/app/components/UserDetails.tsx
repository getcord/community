'use client';

import { useState } from 'react';
import Modal from './Modal';
import { experimental } from '@cord-sdk/react';
import { User } from '@/app/helpers/user';
import styles from './userDetails.module.css';
import {
  ArrowLeftEndOnRectangleIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

interface UserDetailsProps {
  user: User;
}
type UserDetailsModalStateType = 'DETAILS_MENU' | 'UPDATE_USER';

export function UserDetails({ user }: UserDetailsProps) {
  const { userID, name, email } = user;
  const [modalState, setModalState] =
    useState<UserDetailsModalStateType | null>(null);

  const [userDetailsMenuPosition, setUserDetailsMenuPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const openUserDetailsMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setUserDetailsMenuPosition({
      top: rect.top,
      left: rect.left - 240,
    });
    setModalState('DETAILS_MENU');
  };

  const openUpdateUserModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setModalState('UPDATE_USER');
  };

  const closeUserDetailsMenu = () => {
    setModalState(null);
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

      <Modal
        isOpen={modalState === 'DETAILS_MENU'}
        onClose={closeUserDetailsMenu}
        id={'user-details-modal'}
        position={userDetailsMenuPosition}
        className={styles.menu}
      >
        <ul className={styles.menuItems}>
          <li>
            <div className={styles.userInfo}>
              <span className={styles.name}>{name}</span>
              <span className={styles.email}>{email}</span>
            </div>
          </li>

          <hr className={styles.divider} />

          <li className={styles.menuActionItem}>
            <button
              type="button"
              className={styles.button}
              onClick={openUpdateUserModal}
            >
              <PencilSquareIcon width={14} /> Update Profile
            </button>
          </li>
          <li className={styles.menuActionItem}>
            <a href={`/api/auth/logout`} className={styles.link}>
              <ArrowLeftEndOnRectangleIcon width={14} /> Log out {name}
            </a>
          </li>
        </ul>
      </Modal>
    </>
  );
}
