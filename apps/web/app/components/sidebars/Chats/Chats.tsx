"use client"
import styles from "./styles.module.css"
import { useState, useEffect } from "react"
import ChatList from "./ChatList"
import type { Chat } from "../../../page"
import NewChatForm from "./NewChatForm"
import { useSocket } from "@/apps/web/hooks/useSocket"
import type { SessionData } from "@/packages/shared/session"

export default function Chats({ initialChats, session }: { initialChats: Chat[], session: SessionData | undefined }) {
  const [chats, setChats] = useState(initialChats);
  const [showNewChatForm, setShowNewChatForm] = useState(false)
  const [message, setMessage] = useState("+ new chat")

  const { client } = useSocket();


  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  useEffect(() => {
    if (!client) return;
    const off = client.onMessage((msg) => {
      if (!msg) return;
      if (msg.type === "chat:created") {
        const newChat: Chat = msg.payload;
        setChats((prev: Chat[]) => {
          if (prev.some((c) => String(c.id) === String(newChat.id))) return prev;
          return [...prev, newChat];
        });
      }

      if (msg.type === "chat:renamed") {
        const { chatId, newName } = msg.payload; // make sure server sends both
        setChats((prev: Chat[]) => {
          const targetId = String(chatId);
        console.log("CHECKK", msg.payload, targetId, chatId)

          return prev.map((c) =>
            String(c.id) === targetId
              ? { ...c, name: newName }
              : c
          );
        });
      }
      if (msg.type === "chat:deleted") {
        const { chatId } = msg.payload; // make sure server sends both
        setChats((prev: Chat[]) => {
          const targetId = String(chatId);
          return prev.filter((c) =>
            String(c.id) !== targetId
          );
        });
      }
    });

    return () => off();
  }, [client]);


  const validateNewChatRequest = () => {
    if (session?.user) {
      setShowNewChatForm(true)
    } else {
      setMessage("please login first")
      setTimeout(() => {
        setMessage("+ new chat")
      }, 2000)
    }
  }

  return (
    <div className={styles.container}>
      <ChatList chats={chats} />

      <div className={styles.createNewChatButton}>
        {!showNewChatForm ? <button style={{ cursor: "pointer" }} onClick={validateNewChatRequest}>{message}</button> : null}
        {showNewChatForm
          ?
          <NewChatForm
            setShowNewChatForm={setShowNewChatForm}
          />
          : null}
      </div>
    </div>
  )
}