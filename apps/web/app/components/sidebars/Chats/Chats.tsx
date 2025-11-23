"use client"
import styles from "./styles.module.css"
import { useState, useEffect, useRef } from "react"
import ChatList from "./ChatList"

export default function Chats({chats}:{chats: any}) {
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false)
  const [chatName, setChatName] = useState("")
  const [participants, setParticipants] = useState("");

  const chatNameInputRef = useRef<HTMLInputElement | null>(null);
  const participantsInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_LENGTH = 15
  const regex = /^[a-z]$/

  useEffect(() => {
    if (isCreatingNewChat && chatNameInputRef.current) {
      chatNameInputRef.current.focus();
    }
  }, [isCreatingNewChat]);

  useEffect(() => {
    if (!isCreatingNewChat) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancelClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCreatingNewChat]);

  const handleNewChatClick = () => {
    setIsCreatingNewChat(true)
  }
  const handleCancelClick = () => {
    setIsCreatingNewChat(false)
    setChatName("");
    setParticipants("");
  }
  const handleCreateClick = async (e: any) => {
    e.preventDefault();
    console.log("creating...")
    const participantsArray = participants
      .split(',')
      .map(p => p.trim())
    const response = await fetch("/api/chats/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatName, participants: participantsArray }),
      credentials: "include"
    })
    setIsCreatingNewChat(false)
    setChatName("");
    setParticipants("");
  }

  const handleChatNameChange = (e: any) => {
    const raw = e.target.value
    const lowered = raw.toLowerCase()
    const cleaned = lowered.replace(/[^a-z]/g, "")
    const limited = cleaned.slice(0, MAX_LENGTH)
    setChatName(limited)
  }
  const handleParticipantsChange = (e: any) => {
    const raw = e.target.value
    const lowered = raw.toLowerCase()
    const cleaned = lowered.replace(/[^a-z,]/g, "")
    setParticipants(cleaned)
  }

  return (
    <div className={styles.container}>
      <div>
        <ChatList chats={chats}/>
      </div>
      
      <div className={styles.createNewChatButton}>
        {!isCreatingNewChat ? <button style={{ cursor: "pointer" }} onClick={handleNewChatClick}>+ new chat</button> : null}
        {isCreatingNewChat
          ?
          <form
            onSubmit={handleCreateClick}
            className={styles.newChatContainer}
          >
            <div className={styles.newChatFields}>
              <label htmlFor="chatname">chat name </label>
              <input
                id="chatname"
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
                onChange={handleParticipantsChange}
                ref={participantsInputRef}
              />
            </div>
            <div className={styles.newChatButtons}>
              <button type="submit" style={{ cursor: "pointer" }} onClick={handleCreateClick}>create</button>
              <button type="button" style={{ cursor: "pointer" }} onClick={handleCancelClick}>cancel</button>
            </div>
          </form>
          : null}

      </div>
    </div>
  )
}