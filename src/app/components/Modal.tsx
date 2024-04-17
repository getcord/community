import { useEffect, useRef } from 'react';
import type { PropsWithChildren, CSSProperties } from 'react';
import { ReactPortal } from '@/app/components/ReactPortal';
import cx from 'classnames';
import styles from './modal.module.css';

export interface ModalProps extends PropsWithChildren {
  id?: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  position?: { top?: number; left?: number };
  hasDarkBackground?: boolean;
}

export default function Modal({
  id,
  onClose,
  isOpen,
  children,
  className,
  position,
  hasDarkBackground,
}: ModalProps) {
  const modalDialogRef = useRef<HTMLDivElement | null>(null);
  // TODO-FIX: auto-focus the modal dialog when opened
  useEffect(() => {
    if (isOpen && modalDialogRef?.current) {
      modalDialogRef?.current.focus();
    }
  }, [isOpen, modalDialogRef]);

  const handleContentClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    // Prevent modal closing when we click on it
    e.stopPropagation();
  };

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

  if (!isOpen) {
    return null;
  }

  const modalStyle: CSSProperties = {
    ...position,
    position: 'fixed',
  };

  return (
    <ReactPortal wrapperID={id}>
      <div
        className={cx(styles.modalOverlay, {
          [styles.darkOverlay]: hasDarkBackground,
        })}
        onClick={onClose}
        tabIndex={-1}
      >
        <div
          className={cx(styles.modalContainer, className)}
          style={modalStyle}
          onClick={handleContentClick}
          ref={modalDialogRef}
        >
          {children}
        </div>
      </div>
    </ReactPortal>
  );
}
