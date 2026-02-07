"use client"

import styles from "./ChatRow.module.css"
import { useRef, useEffect } from "react"
import { FaEllipsisH } from "react-icons/fa";
import { Chat } from "@ethos/shared";

type ChatRowProps = {
  chat: Chat,
  getChat: (chatId: string) => void,
  handleEllipsesClick: (chatId: string) => void,
  openId: string | null;
  setOpenId: React.Dispatch<React.SetStateAction<string | null>>,
  onLeave: (chat: Chat) => void,
  onRename: (chat: Chat) => void
}

export default function ChatRow({
  chat,
  getChat,
  handleEllipsesClick,
  openId,
  setOpenId,
  onLeave,
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

  const getUsernames = (): string => {
    return chat.members
      .reduce((acc: string[], curr) => {
        const { username } = curr;
        acc.push(username);
        return acc
      }, [])
      .join(", ")
  }

  return (
    <div ref={dropdownRef}>
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
          onClick={() => handleEllipsesClick(chat.id)}
        >
          <FaEllipsisH />
          {openId === chat.id && <div
            className={styles.chatRowDropdown}
          >
            <div className={styles.chatRowDropdownList}>
              <div
                className={styles.chatRowDropdownItem}
                onClick={() => onRename(chat)}>
                {chat.subject ? "Change Subject" : "Add Subject"}
              </div>
              <div className={styles.chatRowDropdownItem} onClick={() => onLeave(chat)}>Leave Chat</div>
            </div>
          </div>}

        </div>
      </div>
    </div>
  )
}