// app/components/ConfirmModal.tsx
import React from 'react';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  // If the app just completed payment and set the `justPaid` flag,
  // we must never show the resume modal on first entrance.
  if (typeof window !== 'undefined') {
    try {
      const justPaid = localStorage.getItem('justPaid')
      if (justPaid) return null
    } catch (e) {
      // ignore
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <button onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
            새로 시작
          </button>
          <button onClick={onConfirm} className={`${styles.button} ${styles.confirmButton}`}>
            이어하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
