"use client"

import styles from "./ChatRow.module.css"
import { useRef, useEffect } from "react"
import { FaEllipsisH } from "react-icons/fa";
import ChatRowOptions from "./ChatRowOptions";
import { Chat } from "../../../home/page";

type ChatRowProps = {
  chat: Chat,
  getChat: (chatId: string, chatName: string) => void,
  handleEllipsesClick: (chatId: string) => void,
  openId: string | null;
  setOpenId: React.Dispatch<React.SetStateAction<string | null>>,
  onDelete: (chat: Chat) => void,
  onRename: (chat: Chat) => void
}

export default function ChatRow({
  chat,
  getChat,
  handleEllipsesClick,
  openId,
  setOpenId,
  onDelete,
  onRename
}: ChatRowProps) {

  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (openId !== chat.id) return
    const handleOutsideClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (e.target instanceof Node && dropdownRef.current.contains(e.target)) return;
      setOpenId(null)
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [openId, chat.id])

  return (
    <div ref={dropdownRef}>
      <div className={styles.chatRow}>
        <div
          onClick={() => getChat(chat.id, chat.name)}
          className={styles.chatRowName}
        >
          {chat.name}
        </div>
        <div

          id={chat.id.toString()}
          className={styles.ellipses}
          onClick={() => handleEllipsesClick(chat.id)}
        >
          <FaEllipsisH />
          {openId === chat.id && <ChatRowOptions onDelete={onDelete} chat={chat} onRename={onRename} />}

        </div>
      </div>
    </div>
  )
}