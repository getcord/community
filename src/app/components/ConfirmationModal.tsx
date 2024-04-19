'use client';

import Divider from '@/app/ui/Divider';
import Modal, { ModalProps } from './Modal';
import styles from './confirmationmodal.module.css';
import Button from '@/app/ui/Button';

type ConfirmationModalProps = ModalProps & {
  onConfirm: () => void;
  title: string;
  confirmActionText: string;
};
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmActionText,
  children,
}: ConfirmationModalProps) {
  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      hasDarkBackground={true}
      className={styles.modal}
      onClickOutside={onClose}
    >
      <div className={styles.modalContent}>
        <h2 className={styles.header}>{title}</h2>
        <Divider />
        {children}
        <Divider />
        <div className={styles.footer}>
          <Button
            behaveAs={'button'}
            onClick={onClose}
            variant={'outline'}
            aria-label={'Cancel'}
          >
            Cancel
          </Button>
          <Button
            behaveAs={'button'}
            onClick={onConfirm}
            aria-label={confirmActionText}
          >
            {confirmActionText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
