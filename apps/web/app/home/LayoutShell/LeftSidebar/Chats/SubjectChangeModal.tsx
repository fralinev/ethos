"use client"
import styles from "./RenameChat.module.css"
import { useState, useRef, useEffect } from "react"
import { Chat } from "@ethos/shared"
import Spinner from "../../../components/Spinner"
import { LuMoveRight } from "react-icons/lu";

type SubjectChangeModalProps = {
  chat: Chat;
  onConfirm: (chatId: string, subject: string | null, newSubject: string) => Promise<void>;
}

export default function SubjectChangeModal({ chat, onConfirm }: SubjectChangeModalProps) {

  const [newSubject, setNewSubject] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = newSubject.trim();
    setMessage("");
    setLoading(true);
    try {
      await onConfirm(chat.id, chat.subject, trimmed);
    } catch (err) {
      setMessage("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {chat.subject ?
            `Change Subject` :
            "Add Subject"}

        </h1>
      </header>
      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.control}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            onChange={(e) => setNewSubject(e.target.value)}
            value={newSubject}
          />
          <div className={styles.buttonWrapper}>
            { loading ? 
            <Spinner size={22}/> :
            <button type="submit" disabled={loading} className={styles.button}><LuMoveRight size={22} /></button>}
          </div>
        </div>

      </form>
      {message && message}
    </section>
  )
}