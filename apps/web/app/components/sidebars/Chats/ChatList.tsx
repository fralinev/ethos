"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DeleteChatModal from "./DeleteChatModal";
import { useState } from "react";
import type { Chat } from "../../../(main)/page";
import SectionHeader from "../../SectionHeader";
import styles from "./ChatList.module.css"
import { FaEllipsisH } from "react-icons/fa";
import ChatRowOptions from "./ChatRowOptions";

export default function ChatList({ chats }: {chats: Chat[]}) {
  const [chatPendingDelete, setChatPendingDelete] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("chatId");

  const handleChatClick = (chatId: number) => {
    router.push(`/?chatId=${chatId}`);
  };

  const handleDeleteChatClick = (chat: any) => {
    setChatPendingDelete(chat.id)
  }

  const handleConfirmDelete = async (chat: any) => {
    const response = await fetch(`/api/chats/${chat}`, {
      method: "DELETE"
    })
    if (!response.ok) {
      console.error("Failed to delete chat:", await response.text());
      return; // optionally show toast, etc.
    }
    setChatPendingDelete(null)
    if (currentChatId === chat) {
      router.push("/")
    } else {
      router.refresh()
    }
  }

  return (
    <div id="chat-list-container" className={styles.chatListContainer}>
      <SectionHeader text="chats"/>
      <div>
        {chatPendingDelete && (
          <DeleteChatModal
            chat={chatPendingDelete}
            onCancel={() => setChatPendingDelete(null)}
            onConfirm={() => handleConfirmDelete(chatPendingDelete)}
          />
        )}
      </div>

      <div id="chat-list">
        {chats.length > 0 && chats.map((chat:Chat) => {
          const isSelected = currentChatId === chat.id.toString();

          return (
            <div key={chat.id} className={styles.chatRow}>
              <div
                onClick={() => handleChatClick(chat.id)}
                className={styles.chatRowName}
              >
                {chat.name}
              </div>
              <button key={`delete-button-${chat.id}`} className={styles.optionsButton} onClick={() => handleDeleteChatClick(chat)}><FaEllipsisH /></button>
              {/* <ChatRowOptions/> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
