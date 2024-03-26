'use client';

import Modal, { ModalProps } from './Modal';
import { User } from '@/app/helpers/user';
import Button from '@/app/ui/Button';
import styles from './updateuserdetailsmodal.module.css';
import { useCallback, useState } from 'react';
import Divider from '@/app/ui/Divider';
import { SERVER_HOST } from '@/consts';

interface UserDetailsProps extends ModalProps {
  user: User;
}

export default function UpdateUserDetailsModal({
  isOpen,
  onClose,
  user,
}: UserDetailsProps) {
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
    onClose();
  }, [onClose, userID, userName]);

  const handleCloseModal = useCallback(() => {
    setUserName('');
    setError('');
    onClose();
  }, [onClose]);

  const handleContentClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    // Prevent click event propagation, which fixed bug where modal would close when we click on it
    e.stopPropagation();
  };

  return (
    <Modal
      id={'update-user-modal'}
      onClose={handleCloseModal}
      isOpen={isOpen}
      className={styles.modal}
      hasDarkBackground={true}
    >
      <div className={styles.modalContent} onClick={handleContentClick}>
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
              onChange={(e) => setUserName(e.target.value)}
              required
              className={styles.input}
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
    </Modal>
  );
}
