"use client"
import styles from "./styles.module.css"
import { useState, useEffect, useRef } from "react"
import ChatList from "./ChatList"
import type { Chat } from "../../../home/page"
import NewChatForm from "./NewChatForm"
import { useSocket } from "@/apps/web/hooks/useSocket"
import type { SessionData } from "@/apps/web/lib/session"
import { useRouter, } from "next/navigation";
import { Modal } from "../../Modal"
import type { User } from "../LeftSidebar"


export default function Chats({
  initialChats,
  session,
  activeChatId,
  users }: {
    initialChats: Chat[],
    session: SessionData | undefined,
    activeChatId: string | undefined,
    users: User[]
  }) {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [message, setMessage] = useState("+ new chat")
  const [chatPendingCreation, setChatPendingCreation] = useState(false)

  const { client } = useSocket();
  const router = useRouter();

  const activeChatIdRef = useRef<string | undefined>(activeChatId);

  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

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
        const { chatId, newName } = msg.payload;
        if (chatId === activeChatIdRef.current) {
          router.push(`/?chatId=${chatId}&chatName=${encodeURIComponent(newName)}`)
        } else {
          setChats((prev: Chat[]) => {
            const targetId = String(chatId);
            return prev.map((c) =>
              String(c.id) === targetId
                ? { ...c, name: newName }
                : c
            );
          });
        }

      }
      if (msg.type === "chat:deleted") {
        const { chatId } = msg.payload;
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
      setChatPendingCreation(true)
    } else {
      setMessage("please login first")
      setTimeout(() => {
        setMessage("+ new chat")
      }, 2000)
    }
  }

  return (
    <div className={styles.container}>
      <ChatList chats={chats} activeChatId={activeChatId} />

      <div className={styles.createNewChatButton}>
        {!chatPendingCreation ? <button style={{ cursor: "pointer" }} onClick={validateNewChatRequest}>{message}</button> : null}
        {/* <Modal onCancel={() => setChatPendingCreation(false)}>
          <div>example content</div>
        </Modal> */}
        {chatPendingCreation
          ?
          <Modal onCancel={() => setChatPendingCreation(false)}>
            <NewChatForm users={users} onCancel={() => setChatPendingCreation(false)}></NewChatForm>
          </Modal>
          : null}
      </div>
    </div>
  )
}