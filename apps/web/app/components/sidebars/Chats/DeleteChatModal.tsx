"use client";

import { useState } from "react";
import styles from "./DeleteChatModal.module.css";

export default function DeleteChatModal({
  chat,
  onConfirm,
}: any) {

  const [loading, setLoading] = useState<boolean>(false)

   const onDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await onConfirm(chat.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Delete chat <span style={{color: "red"}}>{chat.name}</span> for all participants?</h1>
      <form className={styles.form} onSubmit={onDelete}>
        <button type="submit" disabled={loading} className={styles.modalButton}>Delete</button>
      </form>
    </>
  )
}
