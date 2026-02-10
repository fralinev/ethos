"use client"

import { useState, useEffect } from "react"
import ChatHeader from "./ChatHeader/ChatHeader"
import ChatTranscript from "./ChatTranscript/ChatTranscript"
import ChatCommand from "./ChatCommand/ChatCommand"
import { useAppDispatch } from "@/apps/web/store/hooks";
import { startChatLoading, finishChatLoading } from "@/apps/web/store/slices/chatSlice"
import { useSocket } from "@/apps/web/hooks/useSocket";
import { useRouter } from "next/navigation";
import type { ChatMessage, ServerMessage } from "@ethos/shared"
import { getMessages } from "./utils"

export default function Chat({ session, activeChatId }: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const dispatch = useAppDispatch();
  const { client } = useSocket();
  const router = useRouter();
  const userId = session.user.id

  useEffect(() => {
    async function load() {
      const messages = await getMessages(userId, activeChatId)
      setMessages(messages)
      client.joinChat(activeChatId)
      dispatch(finishChatLoading());
    }
    load();

  }, [activeChatId, userId])

  useEffect(() => {
    if (!client) return;
    const off = client.onMessage((msg) => {
      if (msg?.type === "message:created") {
        const newMsg = {
          ...msg.payload,
          chatId: msg.payload.chatId
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

  const onSend = async (text: string) => {
      if (!activeChatId) return;
      try {
        const clientId = crypto.randomUUID();
        setMessages((prev: ChatMessage[]) => {
          return [
            ...prev,
            {
              clientId,
              optimistic: true,
              chatId: activeChatId,
              body: text,
              createdAt: new Date().toISOString(),
              sender: {
                id: session.user.id,
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
        const newMessage: ServerMessage = await resp.json();
        setMessages((prev: ChatMessage[]) => {
          return prev.map((message: ChatMessage) => {
            return "clientId" in message && message.clientId === clientId ? newMessage : message
          })
        }
      
      );
      } catch (err) {
        console.error("Error sending message:", err);
      }
    };

  const exitChat = () => {
    dispatch(startChatLoading())
    client.exitChat(activeChatId)
    return router.push("/home")
  }
  return (
    <>
      <ChatHeader text={"some chat"} onClose={exitChat} />
      <ChatTranscript
        session={session}
        activeChatId={activeChatId} 
        messages={messages}
        />
      <ChatCommand onSend={onSend}/>
    </>
  )
}