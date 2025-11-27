
"use client"

import { useState, useEffect } from "react";
import { SessionData } from "@/packages/shared/session";
import About from "./About";
import ChatTypingArea from "./ChatTypingArea";
import { useSocket } from "../../hooks/useSocket";
import type { Message } from "../page";
import styles from "./ChatTranscript.module.css"
import SectionHeader from "./SectionHeader";


export default function ChatTranscript({
  session,
  selectedChatId,
  initialMessages,
  chatName
}: {
  session?: SessionData,
  selectedChatId?: number,
  initialMessages: Message[],
  chatName: string | undefined,
}) {
  const [messages, setMessages] = useState(initialMessages);

  const { client } = useSocket();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, selectedChatId]);

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
        if (newMsg.chatId === selectedChatId) {
          setMessages((prev: any) => [...prev, newMsg]);
        }
      }
    });
    return () => off();
  }, [client, selectedChatId]);

  const onSend = async (text: string) => {
    if (!selectedChatId) return;
    try {
      const resp = await fetch(`/api/chats/${selectedChatId}/messages`, {
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

  if (!session?.user) {
    return <About />
  }

  if (!selectedChatId) {
    return <About />
  }

  return (
    <div id="transcript-container" className={styles.transcriptContainer}>
      {/* <h2>Chat {chatName}</h2> */}
      <SectionHeader text={chatName} closable={true}/>
      <div>
        <div className={styles.messagesArea}>
          {messages.length === 0 ? (
            <div>No messages yet in this chat.</div>
          ) : (
            <ul>
              {messages.map((m: any) => (
                <li key={m.id}>
                  <strong>{m.sender.username}</strong>: {m.body}{" "}
                  <small>{m.createdAt}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ChatTypingArea onSend={onSend} />
      </div>
    </div>
  );
}
