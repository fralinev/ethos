// app/components/DeleteChatModal.tsx
"use client";

import { useEffect } from "react";
import styles from "./DeleteChatModal.module.css";

export default function DeleteChatModal({
  chat,
  onConfirm,
  onCancel,
  isDeleting = false,
}:any) {
    
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  // Click on backdrop closes, click inside dialog does not
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-chat-title"
      aria-describedby="delete-chat-description"
      onClick={handleBackdropClick}
    >
      <div className={styles.modal}>
        <h2 id="delete-chat-title" className={styles.title}>
          Delete chat?
        </h2>
        <p id="delete-chat-description" className={styles.description}>
          Are you sure you want to permanently delete{" "}
          <span className={styles.chatName}>&quot;{chat}&quot;</span>?
          <br />
          This will remove all messages in this chat for all participants.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete chat"}
          </button>
        </div>
      </div>
    </div>
  );
}
