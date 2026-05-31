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
import { useUser } from "@/apps/web/app/context/UserContext";
import { apiFetch } from "@/apps/web/lib/apiFetch"
import { HttpError } from "@ethos/shared"


export default function Chat({ session, activeChatId, activeChat }: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const dispatch = useAppDispatch();
  const { client } = useSocket();
  const router = useRouter();
  const user = useUser()

  useEffect(() => {
    if (!activeChatId) return;
    let cancelled = false;
    async function getMessages() {
      try {
        const data = await apiFetch<ChatMessage[]>(
          `/api/chats/${activeChatId}`,
          { cache: "no-store" }
        );
        if (cancelled) return;
        setMessages(data)
        dispatch(finishChatLoading());
      } catch (err) {
        if (err instanceof HttpError && err.status === 401) {
          window.location.href = "/";
        } else console.error(err)
      }
    }
    getMessages()
    return () => {
      cancelled = true;
    };
  }, [activeChatId])

  useEffect(() => {
    if (!activeChatId) return;
    client.joinChat(activeChatId);
  }, [activeChatId]);


  useEffect(() => {
    if (!client) return;
    const off = client.onMessage((msg) => {
      if (msg?.type === "message:created") {
        const newMsg = {
          ...msg.payload,
          chatId: msg.payload.chatId
        };
        if (newMsg.sender.id === session.userId) {
          return;
        }
        if (newMsg.chatId === activeChatId) {
          setMessages((prev) => [...prev, newMsg]);
        }
      }
    });
    return () => off();
  }, [client, activeChatId]);

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
              id: user.id,
              username: user.username
            }
          }]
      })
      const newMessage = await apiFetch<ServerMessage>(`/api/chats/${activeChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: text }),
      });
      setMessages((prev: ChatMessage[]) => {
        return prev.map((message: ChatMessage) => {
          return "clientId" in message && message.clientId === clientId ? newMessage : message
        })
      }

      );
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        window.location.href = "/";
      } else console.error(err)
    }
  };

  const exitChat = () => {
    dispatch(startChatLoading())
    client.exitChat(activeChatId)
    return router.push("/home")
  }
  return (
    <>
      <ChatHeader activeChat={activeChat} onClose={exitChat} />
      <ChatTranscript
        session={session}
        activeChatId={activeChatId}
        messages={messages}
      />
      <ChatCommand onSend={onSend} />
    </>
  )
}