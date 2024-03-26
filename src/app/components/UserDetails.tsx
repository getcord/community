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
import Divider from '@/app/ui/Divider';
import Button from '@/app/ui/Button';

interface UserDetailsProps {
  user: User;
}

export function UserDetails({ user }: UserDetailsProps) {
  const { userID, name, email } = user;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
        isOpen={isModalOpen}
        onClose={closeModal}
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

          <Divider />

          <li className={styles.menuActionItem}>
            <Button
              displayAs={'link'}
              className={styles.link}
              href={'/profile/preferences'}
              label={'Update profile'}
            >
              <PencilSquareIcon width={14} /> Update Profile
            </Button>
          </li>
          <li className={styles.menuActionItem}>
            <Button
              displayAs={'a'}
              href={`/api/auth/logout`}
              className={styles.link}
              label={'Log Out'}
            >
              <ArrowLeftEndOnRectangleIcon width={14} /> Log out
            </Button>
          </li>
        </ul>
      </Modal>
    </>
  );
}
