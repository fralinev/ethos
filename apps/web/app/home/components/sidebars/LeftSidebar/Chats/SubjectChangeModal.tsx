"use client"
import styles from "./RenameChat.module.css"
import { useState, useRef, useEffect } from "react"
import { Chat } from "@ethos/shared"
import Spinner from "../../../Spinner"
import { LuMoveRight } from "react-icons/lu";

type SubjectChangeModalProps = {
  chat: Chat;
  onConfirm: (chatId: string, name: string, newName: string) => Promise<void>;
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
    <>
      <h1>{chat.subject ? `Change Subject: ${chat.subject}` : "Add Subject"} <span style={{ color: "violet" }}>{chat.subject}</span></h1>
      <form className={styles.form} onSubmit={onSubmit}>
        <input
          ref={inputRef}
          className={styles.modalTextInput}
          type="text"
          onChange={(e) => setNewSubject(e.target.value)}
          value={newSubject}
        />
        <button type="submit" disabled={loading} className={styles.modalButton}><LuMoveRight size={22}/></button>
      </form>
      {message && message}
      {loading && <Spinner />}
    </>
  )
}