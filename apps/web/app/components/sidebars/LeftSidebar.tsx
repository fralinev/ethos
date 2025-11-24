"use client"
import Badge from "../../(main)/Badge"
import { SessionData } from "@/packages/shared/session"
import Users from "./Users"
import Chats from "./Chats/Chats"
import styles from "./styles.module.css"
import type { Chat } from "../../(main)/page"

export default function LeftSidebar({ session, initialChats }: { session: SessionData | undefined, initialChats: Chat[] }) {
  return (
    <div className={styles.leftSidebar}>
        <div className={styles.badge}>
          <Badge username={session ? session?.user?.username : "guest"} />
        </div>
        <div className={styles.mainContent}>
          <div className={styles.users}>
            <Users />
          </div>
          <div className={styles.chats}>

            <Chats initialChats={initialChats} session={session}/>
          </div>
        </div>


    </div>
  )
}