
"use client"

import { useState, useEffect } from "react";
import { SessionData } from "../../lib/session";
import About from "./About";
import ChatTypingArea from "./ChatTypingArea";
import { useSocket } from "../../hooks/useSocket";
import type { Message } from "../page";
import styles from "./ChatTranscript.module.css"
import SectionHeader from "./SectionHeader";
import Spinner from "./Spinner";
import { useRouter, } from "next/navigation";



export default function ChatTranscript({
  session,
  currentChatId,
  initialMessages,
  chatName
}: {
  session?: SessionData,
  currentChatId?: number,
  initialMessages: Message[],
  chatName: string | undefined,
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [loading, setLoading] = useState<boolean>(false)

  const { client } = useSocket();
  const router = useRouter();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, currentChatId]);

  useEffect(() => {
    if (!client) return;
    const off = client.onMessage((msg) => {
      if (msg?.type === "message:created") {
        const newMsg = {
          ...msg.payload,
          chatId: Number(msg.payload.chatId)
        };
        if (session?.user && newMsg.sender.id === session.user.id) {
          return;
        }
        if (newMsg.chatId === currentChatId) {
          setMessages((prev: any) => [...prev, newMsg]);
        }
      }
    });
    return () => off();
  }, [client, currentChatId]);

  const onSend = async (text: string) => {
    if (!currentChatId) return;
    try {
      const resp = await fetch(`/api/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: text }),
      });
      if (!resp.ok) {
        console.error("Failed to send message", resp.status);
        return;
      }
      const newMessage: any = await resp.json();
      console.log("checkk new message", newMessage)
      setMessages((prev: any) => [...prev, newMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const exitChat = () => {
    setLoading(true)
    return router.push("/")
  }

  if (!session?.user) {
    return <About />
  }

  if (!currentChatId) {
    return <About />
  }

  return (
    <div id="transcript-container" className={styles.transcriptContainer}>
      <SectionHeader text={chatName} onClose={exitChat} />
      {loading 
        ? <div style={{flex: 1, display: "flex", justifyContent: "center", alignItems: "center"}}> <Spinner size={60}/> </div>
        : <div className={styles.messagesArea}>
          {messages.length === 0 ? (
            <div>No messages yet in this chat.</div>
          ) : (
            <ul style={{ padding: "20px" }}>
              {messages.map((m: any) => (
                <li key={m.id}>
                  <strong>{m.sender.username}</strong>: {m.body}{" "}
                  <small>{m.createdAt}</small>
                </li>
              ))}
            </ul>
          )}
        </div>}

      <ChatTypingArea onSend={onSend} />
    </div>
  );
}
