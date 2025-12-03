"use client"
import styles from "./Modal.module.css"
import { ReactNode } from "react";
import { useEscape } from "../../hooks/useEscape"

type ModalProps = {
  children: ReactNode;
  onCancel: () => void;
};

export const Modal = ({children, onCancel}:ModalProps) => {
    useEscape(onCancel)

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }
  return (
    <div onClick={handleBackdropClick} className={styles.backdrop}>
      <div className={styles.modal}>
          {children}
      </div>
    </div>
  )
}