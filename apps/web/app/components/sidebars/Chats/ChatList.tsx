"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DeleteChatModal from "./DeleteChatModal";
import { useState } from "react";
import type { Chat } from "../../../(main)/page";
import SectionHeader from "../../SectionHeader";
import styles from "./ChatList.module.css"
import ChatRow from "./ChatRow"

export default function ChatList({ chats }: { chats: Chat[] }) {
  const [chatPendingDelete, setChatPendingDelete] = useState<Chat | null>(null);
  const [openId, setOpenId] = useState<number | null>(null)

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = Number(searchParams.get("chatId"));

  const handleChatClick = (chatId: number) => {
    router.push(`/?chatId=${chatId}`);
  };

  const onDelete = (chat: any) => {
    setChatPendingDelete(chat)
  }

  // const onRename =

  const handleConfirmDelete = async (chatId: number) => {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: "DELETE"
    })
    if (!response.ok) {
      console.error("Failed to delete chat:", await response.text());
      return; // optionally show toast, etc.
    }
    setChatPendingDelete(null)
    if (currentChatId === chatId) {
      router.push("/")
    } else {
      router.refresh()
    }
  }

  const handleEllipsesClick = (chatId: number) => {
    setOpenId((prev) => (prev === chatId ? null : chatId));
  };

  return (
    <div id="chat-list-container" className={styles.chatListContainer}>
      <SectionHeader text="chats" />
      <div>
        {chatPendingDelete && (
          <DeleteChatModal
            chat={chatPendingDelete}
            onCancel={() => setChatPendingDelete(null)}
            onConfirm={() => handleConfirmDelete(chatPendingDelete.id)}
          />
        )}
      </div>

      <div id="chat-list">
        {chats.length > 0 && chats.map((chat: Chat) => {
          const isSelected = currentChatId === chat.id;

          return (
            <div key={chat.id}>
              <ChatRow
                chat={chat}
                isSelected={isSelected}
                handleChatClick={handleChatClick}
                handleEllipsesClick={handleEllipsesClick}
                openId={openId}
                onDelete={onDelete}
                setOpenId={setOpenId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
