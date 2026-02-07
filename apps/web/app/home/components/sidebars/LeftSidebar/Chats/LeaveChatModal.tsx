"use client";

import { useState } from "react";
import styles from "./LeaveChatModal.module.css";
import Spinner from "../../../Spinner";

export default function LeaveChatModal({
  chat,
  onConfirm,
}: any) {

  const [loading, setLoading] = useState<boolean>(false)

   const leaveChat = async (e: React.FormEvent<HTMLFormElement>) => {
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
      <h1>Leave chat <span style={{color: "violet"}}>{chat.subject}</span>?</h1>
      <form className={styles.form} onSubmit={leaveChat}>
        {loading ? <Spinner/> : <button type="submit" disabled={loading} className={styles.modalButton}>Leave</button>}
      </form>
    </>
  )
}
