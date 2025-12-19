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
import { useAppDispatch } from "@/apps/web/store/hooks";
import { startChatLoading } from "@/apps/web/store/slices/chatSlice"

export default function ChatList({ chats, activeChatId }: { chats: Chat[], activeChatId: number | undefined }) {
  const [chatPendingDelete, setChatPendingDelete] = useState<Chat | null>(null);
  const [chatPendingRename, setChatPendingRename] = useState<Chat | null>(null);
  const [openId, setOpenId] = useState<number | null>(null)

  const router = useRouter();
  const dispatch = useAppDispatch();  
  const searchParams = useSearchParams();
  // const currentChatId = Number(searchParams.get("chatId"));

  const getChat = (chatId: number, chatName: string) => {
    console.log("getting chat...")
    // TODO: fix this.  Either explicitly make chat.id a string, or force it into a number earlier
    if (Number(chatId) === activeChatId) return;
    dispatch(startChatLoading());
    router.push(`/?chatId=${chatId}&chatName=${encodeURIComponent(chatName)}`);
  };

  const onDelete = (chat: Chat) => {
    setChatPendingDelete(chat)
  }

  const onRename = (chat: Chat) => {
    setChatPendingRename(chat)
  }

  const confirmDelete = async (chatId: number) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: "DELETE"
      })
      setChatPendingDelete(null)
      // TODO: fix this.  Figure out when they are numbers and when they are strings
      if (activeChatId?.toString() === chatId.toString()) {
        router.push("/")
      }
    } catch (err) {
      console.error(err)
    }
    
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
