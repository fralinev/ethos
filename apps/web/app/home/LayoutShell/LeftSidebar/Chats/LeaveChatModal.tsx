"use client";

import { useState } from "react";
import styles from "./LeaveChatModal.module.css";
import Spinner from "../../../components/Spinner";

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
      <section className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Leave chat?</h1>
        </header>
        <form className={styles.form} onSubmit={leaveChat}>
          {loading ? <Spinner /> : <button type="submit" disabled={loading} className={styles.button}>Leave</button>}
        </form>
      </section>
    </>
  )
}
