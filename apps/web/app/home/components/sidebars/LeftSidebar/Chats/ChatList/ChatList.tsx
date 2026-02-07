"use client";

import { useRouter } from "next/navigation";
import LeaveChatModal from "../LeaveChatModal";
import { useState } from "react";
import type { Chat } from "@ethos/shared"
import styles from "./ChatList.module.css"
import ChatRow from "../ChatRow"
import SubjectChangeModal from "../SubjectChangeModal";
import { Modal } from "../../../../Modal";
import { useAppDispatch } from "@/apps/web/store/hooks";
import { startChatLoading } from "@/apps/web/store/slices/chatSlice"
import { useSocket } from "@/apps/web/hooks/useSocket";

export default function ChatList({ chats, activeChatId }: { chats: Chat[], activeChatId: string | undefined }) {
  const [chatPendingRename, setChatPendingRename] = useState<Chat | null>(null);
  const [openId, setOpenId] = useState<string | null>(null)
  const [chatPendingLeave, setChatPendingLeave] = useState<Chat | null>(null)

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { client } = useSocket();

  const getChat = (chatId: string) => {
    if (chatId === activeChatId) return;
    if (activeChatId) client.exitChat(activeChatId)
    // client.joinChat(chatId)
    dispatch(startChatLoading());
    router.push(`/home?chatId=${chatId}`);
  };



  const onRename = (chat: Chat) => {
    setChatPendingRename(chat)
  }

  const handleLeaveChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "POST",
      })
      const data = await response.json()
      setChatPendingLeave(null)
      if (activeChatId === chatId) {
        router.push("/home")
      }
    } catch (err) {
      console.error(err)
    }
  }


  const handleSubjectChange = async (chatId: string, subject: string, newSubject: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, newSubject })
      })
    } catch (err) {
      console.error(err)
    }
    setChatPendingRename(null)

  }

  const handleEllipsesClick = (chatId: string) => {
    setOpenId((prev) => (prev === chatId ? null : chatId));
  };

  return (
    <div id="chat-list-container" className={styles.chatListContainer}>
      {/* <SectionHeader text="chats" /> */}
      <div>
        {chatPendingLeave && (
          <Modal onCancel={() => setChatPendingLeave(null)}>
            <LeaveChatModal
              chat={chatPendingLeave}
              onConfirm={() => handleLeaveChat(chatPendingLeave.id)}
            />
          </Modal>
        )}
      </div>
      <div>
        {chatPendingRename && (
          <Modal onCancel={() => setChatPendingRename(null)}>
            <SubjectChangeModal
              chat={chatPendingRename}
              onConfirm={handleSubjectChange}
            />
          </Modal>
        )}
      </div>

      <div id="chat-list" style={{ padding: "10px" }}>
        {chats.length > 0 && chats.map((chat: Chat) => {
          return (
            <div key={chat.id}>
              <ChatRow
                chat={chat}
                getChat={getChat}
                handleEllipsesClick={handleEllipsesClick}
                openId={openId}
                onLeave={() => setChatPendingLeave(chat)}
                onRename={onRename}
                setOpenId={setOpenId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
