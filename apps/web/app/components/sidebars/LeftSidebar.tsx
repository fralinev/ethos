"use client"
import Badge from "../Badge"
import { SessionData } from "@/apps/web/lib/session"
import Users from "./Users"
import Chats from "./Chats/Chats"
import styles from "./LeftSidebar.module.css"
import type { Chat } from "../../page"

export default function LeftSidebar({
  session,
  initialChats,
  currentChatId }: {
    session: SessionData | undefined,
    initialChats: Chat[],
    currentChatId: number | undefined
  }) {

  console.log("ccid leftsidebar", currentChatId)

  return (
    <div className={styles.leftSidebar}>
      <div className={styles.badge}>
        <Badge username={session?.user?.username ?? "guest"} />
      </div>
      <div className={styles.mainContent}>
        <div className={styles.users}>
          <Users />
        </div>
        <div className={styles.chats}>

          <Chats initialChats={initialChats} session={session} currentChatId={currentChatId} />
        </div>
      </div>
    </div>
  )
}