"use client";

import { useRouter, useSearchParams } from "next/navigation";
import DeleteChatModal from "./DeleteChatModal";
import { useState } from "react";
import type { Chat } from "../../../(main)/page";

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
    console.log("check chat", chat)
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
    <div>
      <div>CHATLIST</div>
      <div>
        {chatPendingDelete && (
          <DeleteChatModal
            chat={chatPendingDelete}
            onCancel={() => setChatPendingDelete(null)}
            onConfirm={() => handleConfirmDelete(chatPendingDelete)}
          />
        )}
      </div>

      <div>
        {chats.length > 0 && chats.map((c:any) => {
          const isSelected = currentChatId === c.id.toString();

          return (
            <div key={c.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                onClick={() => handleChatClick(c.id)}
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                  background: isSelected ? "#e0e0e0" : "transparent",
                  borderRadius: 6,
                  marginBottom: 4,
                }}
              >
                {c.name}
              </div>
              <button key={`delete-button-${c.id}`} onClick={() => handleDeleteChatClick(c)}>delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
