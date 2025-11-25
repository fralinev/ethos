"use client"

import styles from "./ChatRow.module.css"
import { useRef,useEffect } from "react"
import { FaEllipsisH } from "react-icons/fa";
import ChatRowOptions from "./ChatRowOptions";

export default function ChatRow({ chat, isSelected, handleChatClick, handleEllipsesClick, openId, setOpenId, onDelete }: any) {

  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (openId !== chat.id) return
    const handleOutsideClick = (e: any) => {
      if (!dropdownRef.current) return;
      if (dropdownRef.current.contains(e.target)) return;
      setOpenId(null)
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [openId, chat.id])

  return (
    <div ref={dropdownRef}>
      <div className={styles.chatRow}>
        <div
          onClick={() => handleChatClick(chat.id)}
          className={styles.chatRowName}
        >
          {chat.name}
        </div>
        <div
          
          // key={`ellipsis-${chat.id}`}
          id={chat.id.toString()}
          className={styles.ellipses}
          onClick={() => handleEllipsesClick(chat.id)}
        >
          <FaEllipsisH />
          {openId === chat.id && <ChatRowOptions onDelete={onDelete} chat={chat} />}

        </div>
      </div>
    </div>
  )
}