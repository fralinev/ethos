"use client";

import { useRouter } from "next/navigation";
import LeaveChatModal from "../LeaveChatModal";
import { useState } from "react";
import type { Chat } from "@ethos/shared"
import styles from "./ChatList.module.css"
import ChatRow from "./ChatRow/ChatRow"
import SubjectChangeModal from "../SubjectChangeModal";
import { Modal } from "../../../../components/Modal";
import { useAppDispatch } from "@/apps/web/store/hooks";
import { startChatLoading } from "@/apps/web/store/slices/chatSlice"
import { useSocket } from "@/apps/web/hooks/useSocket";
import { apiFetch } from "@/apps/web/lib/apiFetch";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"

export default function ChatList({ chats, activeTab, activeChatId }: { chats: Chat[], activeTab: string, activeChatId: string | undefined }) {
  const [chatPendingRename, setChatPendingRename] = useState<Chat | null>(null);
  const [openId, setOpenId] = useState<string | null>(null)
  const [chatPendingLeave, setChatPendingLeave] = useState<Chat | null>(null)

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { client } = useSocket();

  const getChat = (chatId: string) => {
    if (chatId === activeChatId) return;
    if (activeChatId) client.exitChat(activeChatId)
    dispatch(startChatLoading());
    router.push(`/home?chatId=${chatId}`);
  };

  // const { data: profile, isPending } = useQuery({
  //   queryKey: ["profile"],
  //   queryFn: () => fetch("/api/profiles").then(r => r.json()).then(d => d.profile),
  // })

  const { mutate: handleSubjectChange, isPending } = useMutation({
    mutationFn: async ({ chatId, subject, newSubject }: { chatId: string, subject: string | null, newSubject: string }) => {
      return fetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, newSubject })
      }).then(r => r.json()).then(d => {console.log("data", d)})
    },
    onSuccess: () => {
      setChatPendingRename(null)
    },
    onError: (err) => {
      console.error(err)
    }
  })

  const onRename = (chat: Chat) => {
    setChatPendingRename(chat)
  }

  const handleLeaveChat = async (chatId: string) => {
    try {
      await apiFetch(`/api/chats/${chatId}/members`, {
        method: "DELETE",
      })
      setChatPendingLeave(null)
      if (activeChatId === chatId) {
        router.push("/home")
      }
    } catch (err) {
      console.error(err)
    }
  }


  // const handleSubjectChange = async (chatId: string, subject: string | null, newSubject: string) => {
  //   try {
  //     const response = await fetch(`/api/chats/${chatId}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ subject, newSubject })
  //     })
  //   } catch (err) {
  //     console.error(err)
  //   }
  //   setChatPendingRename(null)

  // }

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
            <div onClick={() => getChat(chat.id)} style={{ cursor: "pointer" }} key={chat.id}>
              <ChatRow
                chat={chat}
                getChat={getChat}
                activeTab={activeTab}
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
