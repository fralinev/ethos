"use client"
import styles from "./Modal.module.css"
import { ReactNode } from "react";
import { useEscape } from "../../hooks/useEscape"

type ModalProps = {
  children: ReactNode;
  onCancel: () => void;
  onCloseDropdown?: () => {} | undefined
};

export const Modal = ({children, onCancel, onCloseDropdown}:ModalProps) => {
    useEscape(onCancel)

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }
  return (
    <div onClick={handleBackdropClick} className={styles.backdrop}>
      <div onClick={onCloseDropdown} className={styles.modal}>
          {children}
      </div>
    </div>
  )
}