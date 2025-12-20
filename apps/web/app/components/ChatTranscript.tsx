
"use client"

import { useState, useEffect } from "react";
import { SessionData } from "../../lib/session";
import About from "./About";
import ChatTypingArea from "./ChatTypingArea";
import { useSocket } from "../../hooks/useSocket";
import type { Message, ServerMessage, OptimisticMessage, ChatMessage, AuthedSession } from "../page";
import styles from "./ChatTranscript.module.css"
import SectionHeader from "./SectionHeader";
import Spinner from "./Spinner";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../store/hooks";
import { startChatLoading, finishChatLoading } from "@/apps/web/store/slices/chatSlice"
import { useAppDispatch } from "@/apps/web/store/hooks";


export default function ChatTranscript({
  session,
  activeChatId,
  chatName
}: {
  session: AuthedSession,
  activeChatId?: number,
  chatName: string | undefined,
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { client } = useSocket();
  const dispatch = useAppDispatch();

  const router = useRouter();
  const isChatLoading = useAppSelector((s) => s.ui.isChatLoading);

  


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
        if (newMsg.chatId === activeChatId) {
          setMessages((prev) => [...prev, newMsg]);
        }
      }
    });
    return () => off();
  }, [client, activeChatId, session?.user?.id]);

  useEffect(() => {
    const getMessages = async () => {
      if (session?.user && activeChatId) {
        try {
          const response = await fetch(
            `/api/chats/${activeChatId}`,
            {
              headers: {
                "x-user-id": session.user.id.toString(),
              },
              cache: "no-store",
            }
          );

          if (!response.ok) {
            console.error(
              "Failed to fetch messages:",
              response.status,
              response.statusText
            );
          } else {
            const data = await response.json();
            setMessages(data)
          }
        } catch (err) {
          console.error("Error fetching messages:", err);
        } finally {
          dispatch(finishChatLoading());
        }
      }
    };
    getMessages();

  }, [activeChatId, session?.user?.id])

  const onSend = async (text: string) => {
    if (!activeChatId) return;
    try {
      const clientId = crypto.randomUUID();
      setMessages((prev:ChatMessage[]) => {
        return [
          ...prev, 
          {
            clientId,
            optimistic: true,
            chatId: activeChatId,
            body: text,
            createdAt: new Date().toISOString(),
            sender: {
              id: Number(session.user.id),
              username: session.user.username
            }
        }]
      })
      const resp = await fetch(`/api/chats/${activeChatId}/messages`, {
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
      const newMessage: Message = await resp.json();
      setMessages((prev: any) => 
        prev.map((message: any) => message.clientId === clientId ? newMessage : message));
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // console.log("Checkk messages", messages)

  const exitChat = () => {
    dispatch(startChatLoading())
    return router.push("/")
  }

  // if (!session?.user || !activeChatId) {
  //   return isChatLoading 
  //   ?  <Spinner size={60} /> 
  //   : <About />
  // }

  return (
    <div id="transcript-container" className={styles.transcriptContainer}>
      <SectionHeader text={chatName} onClose={exitChat} />
      {isChatLoading
        ?  <Spinner size={60} /> 
        : <div className={styles.messagesArea}>
          {messages.length === 0 ? (
            <div>No messages yet in this chat.</div>
          ) : (
            <ul style={{ padding: "20px" }}>
              {messages.map((m: any) => (
                <li key={m.id ?? m.clientId}>
                  <strong>{m.sender.username}</strong>: {m.body}{" "}
                  {/* <small>{m.createdAt}</small> */}
                </li>
              ))}
            </ul>
          )}
        </div>}

      <ChatTypingArea onSend={onSend} />
    </div>
  );
}
