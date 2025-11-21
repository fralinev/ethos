"use client"
import Badge from "../../(main)/Badge"
import { SessionData } from "@/packages/shared/session"
import Users from "./Users"
import Chats from "./Chats/Chats"
import styles from "./styles.module.css"

export default function LeftSidebar({ session }: { session: SessionData | undefined }) {
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

            <Chats />
          </div>
        </div>


    </div>
  )
}