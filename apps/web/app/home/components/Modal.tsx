"use client"
import styles from "./Modal.module.css"
import { ReactNode, useRef } from "react";
import { useEscape } from "../../../hooks/useEscape"

type ModalProps = {
  children: ReactNode;
  onCancel: () => void;
  onCloseDropdown?: () => {} | undefined
};

export const Modal = ({ children, onCancel, onCloseDropdown }: ModalProps) => {
  const startedOnBackdropRef = useRef(false);
  useEscape(onCancel)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      startedOnBackdropRef.current = true;
    } else {
      startedOnBackdropRef.current = false;
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      startedOnBackdropRef.current &&
      e.target === e.currentTarget
    ) {
      onCancel();
    }
    startedOnBackdropRef.current = false;
  };

  
  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={styles.backdrop}>
      {children}
    </div>
  )
}