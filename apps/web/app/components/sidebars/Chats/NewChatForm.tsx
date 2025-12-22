"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./NewChatForm.module.css"
import { useNewChatForm } from "../../../../hooks/useNewChatForm"
import AddUsersDropdown from "./AddUsersDropdown"
import type { User } from "../LeftSidebar"

export default function NewChatForm({ users, onCancel }: { users: User[], onCancel: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])


  const {
    chatName,
    handleCancel,
    handleCreate,
    handleChatNameChange,
  } = useNewChatForm(onCancel, selectedUsers)

  const chatNameInputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => {
    if (chatNameInputRef.current) {
      chatNameInputRef.current.focus();
    }
  }, []);
  
  return (
    <>
      <h1>Create new chat <span style={{ color: "lightgreen" }}>{chatName}</span> {chatName.length > 0 ? "?" : null}</h1>
      <form
        onSubmit={handleCreate}
        className={styles.newChatContainer}
      >
        <div className={styles.newChatFields}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <label style={{ textAlign: "right", flex: 1, paddingRight: "12px" }} htmlFor="chat-name">Name this chat: </label>
            <input
              id="chat-name"
              type="text"
              className={styles.chatName}
              value={chatName}
              onChange={handleChatNameChange}
              ref={chatNameInputRef}
              maxLength={30}
              spellCheck="false"
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <label style={{ textAlign: "right", flex: 1, paddingRight: "12px" }} htmlFor="participants">Add users: </label>
            <div style={{position: "relative"}}>
              <input
                type="text"
                placeholder="Click here to add users"
                id="participants"
                className={styles.chatName}
                onClick={() => setShowDropdown(!showDropdown)}
              // value={participants}
              // onChange={handlePartsChange}

              />{showDropdown && <AddUsersDropdown users={users} selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} handleCreate={handleCreate}/>}
            </div>
          </div>
        </div>
        <div className={styles.newChatButtons}>
          <button type="button" style={{ cursor: "pointer" }} onClick={handleCancel} className={styles.modalButton}>Cancel</button>
          <button type="submit" style={{ cursor: "pointer" }} className={styles.modalButton}>Create</button>
        </div>
      </form>
    </>
  )
}