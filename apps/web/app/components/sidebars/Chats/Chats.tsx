"use client"
import styles from "./styles.module.css"
import { useState } from "react"

export default function Chats() {
  const [toggleNewChatCreation, setToggleNewChatCreation] = useState(false)

  const handleNewChatClick = () => {
    setToggleNewChatCreation(true)
  }
  const handleCancelClick = () => {
    setToggleNewChatCreation(false)
  }

  return (
    <div className={styles.container}>
      <div>
        Chats
      </div>
      <div className={styles.createNewChatButton}>
        {!toggleNewChatCreation ? <button style={{ cursor: "pointer" }} onClick={handleNewChatClick}>+ new chat</button> : null}
        {toggleNewChatCreation
          ?
          <div className={styles.newChatContainer}>
            <div className={styles.newChatFields}>
              <label htmlFor="participants">add comma-separated usernames </label>
              <input id="participants" className={styles.chatName} />
            </div>
            <div className={styles.newChatButtons}>
              <button style={{ cursor: "pointer" }} onClick={handleCancelClick}>create</button> 
              <button style={{ cursor: "pointer" }} onClick={handleCancelClick}>cancel</button>
            </div>
          </div>
          : null}

      </div>
    </div>
  )
}