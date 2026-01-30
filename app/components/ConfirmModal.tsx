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
