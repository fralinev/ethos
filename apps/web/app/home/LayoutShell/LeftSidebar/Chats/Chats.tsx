"use client"
import styles from "./Chats.module.css"
import { useState, useEffect, useRef, useMemo } from "react"
import ChatList from "./ChatList/ChatList"
import NewChatForm from "./ChatList/NewChatForm/NewChatForm"
import { useSocket } from "@/apps/web/hooks/useSocket"
import type { SessionData, Chat } from "@ethos/shared"
import { Modal } from "../../../components/Modal"
import ChatsHeader from "./ChatsHeader/ChatsHeader"
import { IoMdAddCircle } from "react-icons/io";
import { useChatSocketEvents } from "./useChatSocketEvents";



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
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false)

  const { client } = useSocket();

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

  useChatSocketEvents({
    client,
    session,
    activeChatId,
    activeChatIdRef,
    setChats,
    setActiveTab,
  });

  return (
    <div className={styles.chats}>
      <ChatsHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <ChatList chats={activeTab === "direct" ? directChats : groupChats} activeTab={activeTab} activeChatId={activeChatId} />
      <button
        className={styles.createNewChatButton}
        onClick={() => setIsCreatingNewChat(true)}> 
        <span className="test" style={{ alignSelf: "center", margin: "0 4px 0 0" }}><IoMdAddCircle size={20} color="rgba(154, 205, 100, 0.50)" /></span>New Chat
      </button>
      {
        isCreatingNewChat &&
        <Modal onCancel={() => setIsCreatingNewChat(false)}>
          <NewChatForm setIsCreatingNewChat={setIsCreatingNewChat} ></NewChatForm>
        </Modal>
      }
    </div>
  )
}
