'use client';

import Divider from '@/app/ui/Divider';
import Modal, { ModalProps } from './Modal';
import styles from './deleteconfirmationmodal.module.css';
import Button from '@/app/ui/Button';
import { useCallback } from 'react';
import { deleteMessage, deleteThread } from '@/app/actions';
import { useRouter } from 'next/navigation';

type DeleteConfirmationModalProps = ModalProps & {
  threadID: string;
  messageID: string | null;
};
export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  threadID,
  messageID,
}: DeleteConfirmationModalProps) {
  const router = useRouter();

  const onDelete = useCallback(async () => {
    if (!messageID) {
      await deleteThread(threadID);
      router.replace('/');
    } else {
      await deleteMessage(threadID, messageID);
    }
    onClose();
  }, [messageID, onClose, router, threadID]);

  return (
    <Modal
      id={messageID ? 'delete-message-modal' : 'delete-post-modal'}
      onClose={onClose}
      isOpen={isOpen}
      hasDarkBackground={true}
      className={styles.modal}
    >
      <div>
        <h2 className={styles.title}>
          Delete {messageID ? 'Message' : 'Post'}
        </h2>
        <Divider />
      </div>

      <div className={styles.content}>
        <p>
          Are you sure you want to permanently delete this{' '}
          {messageID ? 'message' : 'post'}? This action cannot be undone.
        </p>
        <Divider />

        <div className={styles.footer}>
          <Button
            behaveAs={'button'}
            onClick={onClose}
            variant={'outline'}
            aria-label={'cancel'}
          >
            Cancel
          </Button>
          <Button
            behaveAs={'button'}
            onClick={onDelete}
            aria-label={`delete ${messageID ? 'message' : 'post'}`}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
