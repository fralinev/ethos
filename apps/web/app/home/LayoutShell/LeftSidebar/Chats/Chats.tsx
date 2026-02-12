"use client"
import styles from "./Chats.module.css"
import { useState, useEffect, useRef, useMemo } from "react"
import ChatList from "./ChatList/ChatList"
import NewChatForm from "./ChatList/NewChatForm/NewChatForm"
import { useSocket } from "@/apps/web/hooks/useSocket"
import type { SessionData, Chat, User, SocketMessage } from "@ethos/shared"
import { useRouter, } from "next/navigation";
import { Modal } from "../../../components/Modal"
import ChatsHeader from "./ChatsHeader/ChatsHeader"
import { IoMdAddCircle } from "react-icons/io";



export default function Chats({
  initialChats,
  session,
  activeChatId,
  }: {
    initialChats: Chat[],
    session: SessionData | undefined,
    activeChatId: string | undefined,
  }) {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeTab, setActiveTab] = useState("direct")
  const [chatPendingCreation, setChatPendingCreation] = useState(false)

  const { client } = useSocket();
  const router = useRouter();

  const activeChatIdRef = useRef<string | undefined>(activeChatId);


  const directChats = useMemo(
    () => chats.filter(chat => chat.type === "direct"),
    [chats]
  );

  const groupChats = useMemo(
    () => chats.filter(chat => chat.type === "group"),
    [chats]
  );

  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    if (!client) return;
    const off = client.onMessage((msg: SocketMessage) => {
      if (!msg) return;
      if (msg.type === "chat:created") {
        const newChat: Chat = msg.payload;
        setChats((prev: Chat[]) => {
          if (prev.some((c) => c.id === newChat.id)) return prev;
          return [...prev, newChat];
        });
        setActiveTab(msg.payload.type)
      }

      if (msg.type === "chat:renamed") {
        const { chatId, newSubject } = msg.payload;
        if (chatId === activeChatIdRef.current) {
          router.push(`/home?chatId=${chatId}`)
        } else {
          setChats((prev: Chat[]) => {
            const targetId = String(chatId);
            return prev.map((c) =>
              String(c.id) === targetId
                ? { ...c, subject: newSubject }
                : c
            );
          });
        }
      }
      if (msg.type === "chat:left") {
        if (session?.user?.id === msg.payload.leftBy) {
          if (activeChatId === msg.payload.chatId) {
            router.push("/home")
          } else {
            console.log("chat:left", session?.user?.id, msg.payload)
            setChats((prev: any) => {
              const filtered = prev.filter((chat: Chat) => chat.id !== msg.payload.chatId)
              return filtered
            })
          }

        }
      }
    });

    return () => off();
  }, [client]);

  return (
    <div className={styles.chats}>
      <ChatsHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <ChatList chats={activeTab === "direct" ? directChats : groupChats} activeTab={activeTab} activeChatId={activeChatId} />
      <button
        className={styles.createNewChatButton}
        onClick={() => setChatPendingCreation(true)}> 
        <span className="test" style={{ alignSelf: "center", margin: "0 4px 0 0" }}><IoMdAddCircle size={20} color="rgba(154, 205, 100, 0.50)" /></span>New Chat
      </button>
      {
        chatPendingCreation &&
        <Modal onCancel={() => setChatPendingCreation(false)}>
          <NewChatForm onCancel={() => setChatPendingCreation(false)} session={session}></NewChatForm>
        </Modal>
      }
    </div>
  )
}