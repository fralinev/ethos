"use client";

import { useRouter } from "next/navigation";
import DeleteChatModal from "./DeleteChatModal";
import { useState } from "react";
import type { Chat } from "../../../page";
import styles from "./ChatList.module.css"
import ChatRow from "./ChatRow"
import RenameChatModal from "./RenameChatModal";
import { Modal } from "../../Modal";
import { useAppDispatch } from "@/apps/web/store/hooks";
import { startChatLoading } from "@/apps/web/store/slices/chatSlice"
import { useSocket } from "@/apps/web/hooks/useSocket";

export default function ChatList({ chats, activeChatId }: { chats: Chat[], activeChatId: string | undefined }) {
  const [chatPendingDelete, setChatPendingDelete] = useState<Chat | null>(null);
  const [chatPendingRename, setChatPendingRename] = useState<Chat | null>(null);
  const [openId, setOpenId] = useState<string | null>(null)

  const router = useRouter();
  const dispatch = useAppDispatch();  
  const { client } = useSocket();

  const getChat = (chatId: string, chatName: string) => {
    if (chatId === activeChatId) return;
    dispatch(startChatLoading());
    router.push(`/?chatId=${chatId}&chatName=${encodeURIComponent(chatName)}`);
  };

  const onDelete = (chat: Chat) => {
    setChatPendingDelete(chat)
  }

  const onRename = (chat: Chat) => {
    setChatPendingRename(chat)
  }

  const confirmDelete = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE"
      })
      setChatPendingDelete(null)
      if (activeChatId === chatId) {
        router.push("/")
      }
    } catch (err) {
      console.error(err)
    }
    
  }

  const handleConfirmRename = async (chatId: string, name: string, newName: string) => {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, newName })
    })
    if (!response.ok) {
      console.error("Failed to rename chat:", await response.text());
      return;
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
        {chatPendingDelete && (
          <Modal onCancel={() => setChatPendingDelete(null)}>
            <DeleteChatModal
              chat={chatPendingDelete}
              onConfirm={() => confirmDelete(chatPendingDelete.id)}
            />
          </Modal>
        )}
      </div>
      <div>
        {chatPendingRename && (
          <Modal onCancel={() => setChatPendingRename(null)}>
            <RenameChatModal
              chat={chatPendingRename}
              onConfirm={handleConfirmRename}
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
                onDelete={onDelete}
                onRename={onRename}
                setOpenId={setOpenId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
