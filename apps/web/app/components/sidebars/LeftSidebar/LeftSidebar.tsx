"use client"
import Badge from "../../Badge"
import { SessionData } from "@/apps/web/lib/session"
import UsersList from "./UsersList/UsersList"
import Chats from "../Chats/Chats"
import styles from "./LeftSidebar.module.css"
import type { Chat } from "../../../home/page"
import SectionHeader from "../../SectionHeader"
import { useState, useEffect } from "react"
import Spinner from "../../Spinner"
import Users from "./Users"

export type User = {
  id: string;
  username: string;
  created_at: string;
};

export default function LeftSidebar({
  session,
  initialChats,
  activeChatId }: {
    session: SessionData | undefined,
    initialChats: Chat[],
    activeChatId: string | undefined
  }) {

  return (
    <div className={styles.leftSidebar}>
      <SectionHeader text="Users" />
      <div className={styles.mainContent}>
        <div className={styles.users}>
          <Users/>
        </div>
        <div className={styles.chats}>

          <Chats initialChats={initialChats} session={session} activeChatId={activeChatId} allUsers={[]}/>
        </div>
      </div>
    </div>
  )
}