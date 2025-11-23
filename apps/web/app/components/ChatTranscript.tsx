// app/components/ChatTranscript.tsx (server component, no "use client")

"use client"

import { useState } from "react";
import { SessionData } from "@/packages/shared/session";
import About from "./About";
import ChatTypingArea from "./ChatTypingArea";


export default function ChatTranscript({
  session,
  selectedChatId,
  messages,
}: {
  session?: SessionData;
  selectedChatId?: number;
  messages: any
}) {
  const [localMessages, setLocalMessages] = useState(messages);
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


      // This is the message as returned by Express (with id, sender, timestamp)
      const newMessage: any = await resp.json();
      console.log("BROWSER new message", newMessage)

      // TEMPORARILY append it immediately (optimistic)
      // When you add sockets, you'll replace this with the WS-delivered one.
      setLocalMessages((prev:any) => [...prev, newMessage]);
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

  if (messages.length === 0) {
    return (
      <div>
        <div>No messages yet in this chat.</div>
        <ChatTypingArea onSend={onSend}/>
      </div>
    )
  }

  return (
    <div>
      <h2>Chat {selectedChatId}</h2>
      <ul>
        {messages.map((m: any) => (
          <li key={m.id}>
            <strong>{m.sender.username}</strong>: {m.body}{" "}
            <small>{m.createdAt}</small>
          </li>
        ))}
      </ul>
      <ChatTypingArea onSend={onSend} />
    </div>
  );
}
