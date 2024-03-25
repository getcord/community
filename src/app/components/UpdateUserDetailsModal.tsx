'use client';

import Modal, { ModalProps } from './Modal';
import styles from './updateuserdetailsmodal.module.css';
import Divider from '@/app/components/Divider';
// @ts-expect-error react-dom has no exported type for this hook
// in their latest package (18.2.0)
import { useFormStatus } from 'react-dom';
import { updateUserName } from '@/app/actions';
import Button from '@/app/ui/Button';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      as={'button'}
      style={{ justifySelf: 'end' }}
      type="submit"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? 'Saving...' : 'Save'}
    </Button>
  );
}

export default function UpdateUserDetailsModal({
  isOpen,
  onClose,
}: ModalProps) {
  const handleContentClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    // Prevent click event propagation, which fixed bug where modal would close when we click on it
    e.stopPropagation();
  };

  return (
    <Modal
      id={'update-user-modal'}
      onClose={onClose}
      isOpen={isOpen}
      className={styles.modal}
      hasDarkBackground={true}
    >
      <div className={styles.modalContent} onClick={handleContentClick}>
        <div>
          <h2 className={styles.modalContentTitle}>Update User Details</h2>
          <Divider />
        </div>

        <form className={styles.modalContent} action={updateUserName}>
          <div className={styles.inputContainer}>
            <label htmlFor="username" className={styles.label}>
              User Name:
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              className={styles.input}
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </Modal>
  );
}
