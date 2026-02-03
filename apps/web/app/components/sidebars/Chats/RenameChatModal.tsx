"use client"
import styles from "./RenameChat.module.css"
import { useState } from "react"
import { Chat } from "../../../home/page"
import Spinner from "../../Spinner"

type RenameChatProps = {
  chat: Chat;
  onConfirm: (chatId: string, name: string, newName: string) => Promise<void>;
}

export default function RenameChatModal({ chat, onConfirm }: RenameChatProps) {

  const [newName, setNewName] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (trimmed.length < 3) {
      setMessage("Must be at least 3 letters");
      return;
    }
    setMessage("");
    setLoading(true);
    try {
      await onConfirm(chat.id, chat.name, trimmed);
    } catch (err) {
      setMessage("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Rename Chat <span style={{ color: "violet" }}>{chat.name}</span> ?</h1>
      <form className={styles.form} onSubmit={onSubmit}>
        <input
          className={styles.modalTextInput}
          type="text"
          onChange={(e) => setNewName(e.target.value)}
          value={newName}
        />
        <button type="submit" disabled={loading} className={styles.modalButton}>Rename</button>
      </form>
      {message && message}
      {loading && <Spinner />}
    </>
  )
}