'use client';

import Divider from '@/app/ui/Divider';
import Modal, { ModalProps } from './Modal';
import styles from './confirmationmodal.module.css';
import Button from '@/app/ui/Button';

type ConfirmationModalProps = ModalProps & {
  onConfirm: () => void;
  title: string;
  content: string;
  confirmActionText: string;
};
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  id,
  title,
  content,
  confirmActionText,
}: ConfirmationModalProps) {
  return (
    <Modal
      id={id}
      onClose={onClose}
      isOpen={isOpen}
      hasDarkBackground={true}
      className={styles.modal}
      onClickOutside={onClose}
    >
      <div>
        <h2 className={styles.title}>{title}</h2>
        <Divider />
      </div>

      <div className={styles.content}>
        <p>{content}</p>
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
