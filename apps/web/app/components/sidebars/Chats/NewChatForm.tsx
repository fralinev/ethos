"use client"

import { useEffect, useRef, Dispatch, SetStateAction } from "react"
import styles from "./NewChatForm.module.css"
import { useNewChatForm } from "../../../../hooks/useNewChatForm"

export default function NewChatForm({ setShowNewChatForm }: { setShowNewChatForm: Dispatch<SetStateAction<boolean>> }) {

  const { 
    chatName, 
    participants, 
    handleCancel,
    handleCreate,
    handleChatNameChange,
    handlePartsChange 
  } = useNewChatForm(setShowNewChatForm)

  const chatNameInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    if (chatNameInputRef.current) {
      chatNameInputRef.current.focus();
    }
  }, []);

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className={styles.newChatContainer}
      >
        <div className={styles.newChatFields}>
          <label htmlFor="chat_name">chat name </label>
          <input
            id="chat_name"
            className={styles.chatName}
            value={chatName}
            onChange={handleChatNameChange}
            ref={chatNameInputRef}
            maxLength={30}
          />
          <label htmlFor="participants">comma-separated usernames </label>
          <input
            id="participants"
            className={styles.chatName}
            value={participants}
            onChange={handlePartsChange}
          />
        </div>
        <div className={styles.newChatButtons}>
          <button type="submit" style={{ cursor: "pointer" }}>create</button>
          <button type="button" style={{ cursor: "pointer" }} onClick={handleCancel}>cancel</button>
        </div>
      </form>
    </div>
  )
}