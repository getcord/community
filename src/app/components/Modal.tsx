import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { PropsWithChildren, CSSProperties } from 'react';
import cx from 'classnames';
import styles from './modal.module.css';

export interface ModalProps extends PropsWithChildren {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  hasDarkBackground?: boolean;
  className?: string;
  position?: { top?: number; left?: number };
  onClickOutside?: () => void;
}

export default function Modal({
  id,
  onClose,
  isOpen,
  children,
  className,
  position,
  hasDarkBackground,
  onClickOutside,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleOnDialogClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (!dialogRef || !dialogRef.current) {
        return;
      }

      // when clicking the overlay around the modal
      const dialogDimensions = dialogRef.current.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        onClickOutside?.();
      }
    },
    [onClickOutside],
  );

  useEffect(() => {
    const handleBodyScroll = () => {
      // Disable scrolling when the modal is open
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
    };

    window.addEventListener('scroll', handleBodyScroll);
    return () => {
      window.removeEventListener('scroll', handleBodyScroll);
    };
  }, [isOpen]);

  const modalStyle: CSSProperties = {
    ...position,
    position: 'fixed',
  };

  return (
    <dialog
      id={id}
      ref={dialogRef}
      className={cx(
        styles.dialog,
        {
          [styles.darkBackground]: hasDarkBackground,
          [styles.darkShadow]: !hasDarkBackground,
        },
        className,
      )}
      style={modalStyle}
      autoFocus
      onCancel={onClose}
      onClick={handleOnDialogClick}
    >
      {children}
    </dialog>
  );
}
