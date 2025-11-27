"use client"
import styles from "./RenameChat.module.css"
import { useEffect, useState } from "react"

export default function RenameChatModal({ chat, onCancelRename, handleConfirmRename }: any) {

  const [newName, setNewName] = useState("")

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancelRename()
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value)
  }

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div className={styles.modal}>
        <h3>rename chat {chat.name}</h3>
        <form onSubmit={(e) => handleConfirmRename(e, chat.id, chat.name, newName)}>
          <input
            type="text"
            onChange={handleNameChange}
            value={newName}
          />
          <button type="submit">Submit</button>
        </form>


      </div>
    </div>
  )
}