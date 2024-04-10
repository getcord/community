import cx from 'classnames';
import styles from './resultMessage.module.css';
import { XMarkIcon } from '@heroicons/react/24/outline';

type ResultMessageProps = {
  successMessage: string | null;
  onCloseSuccesMessage: () => void;
  errorMessage: string | null;
  onCloseErrorMessage: () => void;
};
export function ResultMessage({
  successMessage,
  onCloseSuccesMessage,
  errorMessage,
  onCloseErrorMessage,
}: ResultMessageProps) {
  return (
    <div className={styles.container}>
      {successMessage && (
        <div className={cx(styles.success, styles.messageContainer)}>
          <p>{successMessage}</p>
          <button onClick={onCloseSuccesMessage}>
            <XMarkIcon width={'16px'} />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className={cx(styles.error, styles.messageContainer)}>
          <p>{errorMessage}</p>
          <button onClick={onCloseErrorMessage}>
            <XMarkIcon width={'16px'} />
          </button>
        </div>
      )}{' '}
    </div>
  );
}
