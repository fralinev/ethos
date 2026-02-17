"use client"

import styles from "./ChatRow.module.css"
import { useRef, useEffect } from "react"
import { FaEllipsisH } from "react-icons/fa";
import type { Chat, User } from "@ethos/shared";
import { createPortal } from "react-dom";
import { useUser } from "@/apps/web/app/context/UserContext";

type ChatRowProps = {
  chat: Chat,
  getChat: (chatId: string) => void,
  activeTab: string,
  openId: string | null;
  setOpenId: React.Dispatch<React.SetStateAction<string | null>>,
  onLeave: (chat: Chat) => void,
  onRename: (chat: Chat) => void
}


export default function ChatRow({
  chat,
  getChat,
  activeTab,
  openId,
  setOpenId,
  onLeave,
  onRename
}: ChatRowProps) {
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const ellipsisRef = useRef<HTMLSpanElement | null>(null)
  const rect = ellipsisRef.current?.getBoundingClientRect();
  const user = useUser()

  useEffect(() => {
    if (openId !== chat.id) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return
      if (dropdownRef.current?.contains(e.target)) return
      if (ellipsisRef.current?.contains(e.target)) return

      setOpenId(null)
    }
    const close = () => setOpenId(null)
    const el = document.getElementById("chat-list-container");
    el?.addEventListener("scroll", close)
    window.addEventListener("resize", close)
    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      el?.removeEventListener("scroll", close)
      window.removeEventListener("resize", close)
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [openId, chat.id])

  const getUsernames = (): string => {
    return chat.members
      .reduce((acc: string[], curr: User) => {
        const { id, username } = curr;
        if (user.id !== id) acc.push(username);
        return acc
      }, [])
      .join(", ")
  }

  return (
    <div >
      <div className={styles.chatRow}>
        <div
          onClick={() => getChat(chat.id)}
          className={styles.chatRowName}
        >
          {chat.subject ? <span className={styles.subject}>{chat.subject}</span> : <span className={styles.noSubject}>{getUsernames()}</span>}
        </div>
        <div

          id={chat.id.toString()}
          className={styles.ellipses}
        >
          {activeTab === "group" &&
            <span ref={ellipsisRef}
              onClick={() => setOpenId((prev) => (prev === chat.id ? null : chat.id))}>
              <FaEllipsisH />
            </span>}
          {openId === chat.id &&
            createPortal(
              <div ref={dropdownRef} style={{ position: "fixed", top: rect?.bottom, left: rect?.left }} className={styles.chatRowDropdown}>
                <div className={styles.chatRowDropdownList}>
                  <div
                    className={styles.chatRowDropdownItem}
                    onClick={() => onRename(chat)}>
                    {chat.subject ? "Change Subject" : "Add Subject"}
                  </div>
                  <div className={styles.chatRowDropdownItem} onClick={() => onLeave(chat)}>Leave Chat</div>
                </div>
              </div>,
              document.body)
          }
        </div>
      </div>
    </div>
  )
}
