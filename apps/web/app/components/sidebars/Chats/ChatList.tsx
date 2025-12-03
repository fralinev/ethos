"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DeleteChatModal from "./DeleteChatModal";
import { useState } from "react";
import type { Chat } from "../../../page";
import SectionHeader from "../../SectionHeader";
import styles from "./ChatList.module.css"
import ChatRow from "./ChatRow"
import RenameChatModal from "./RenameChatModal";
import { Modal } from "../../Modal";

export default function ChatList({ chats }: { chats: Chat[] }) {
  const [chatPendingDelete, setChatPendingDelete] = useState<Chat | null>(null);
  const [chatPendingRename, setChatPendingRename] = useState<Chat | null>(null);
  const [openId, setOpenId] = useState<number | null>(null)

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentChatId = Number(searchParams.get("chatId"));

  const handleChatClick = (chatId: number, chatName: string) => {
    router.push(`/?chatId=${chatId}&chatName=${encodeURIComponent(chatName)}`);
  };

  const onDelete = (chat: Chat) => {
    setChatPendingDelete(chat)
  }

  const onRename = (chat: Chat) => {
    setChatPendingRename(chat)
  }

  const confirmDelete = async (chatId: number) => {
    const response = await fetch(`/api/chats/${chatId}`, {
      method: "DELETE"
    })
    if (!response.ok) {
      console.error("Failed to delete chat:", await response.text());
      return;
    }
    setChatPendingDelete(null)
    // TODO: fix this.  Figure out when they are numbers and when they are strings
    if (currentChatId.toString() === chatId.toString()) {
      router.push("/")
    } else {
      // router.refresh()
    }
  }

  const onCancelRename = () => {
    setChatPendingRename(null)
  }

  const handleConfirmRename = async (chatId: number, name: string, newName: string) => {
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

  const handleEllipsesClick = (chatId: number) => {
    setOpenId((prev) => (prev === chatId ? null : chatId));
  };

  return (
    <div id="chat-list-container" className={styles.chatListContainer}>
      <SectionHeader text="chats" />
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
                onRename={onRename}
                setOpenId={setOpenId} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
