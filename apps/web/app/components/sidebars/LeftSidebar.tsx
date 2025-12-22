"use client"
import Badge from "../Badge"
import { SessionData } from "@/apps/web/lib/session"
import Users from "./Users"
import Chats from "./Chats/Chats"
import styles from "./LeftSidebar.module.css"
import type { Chat } from "../../page"
import SectionHeader from "../SectionHeader"
import { useState, useEffect } from "react"
import Spinner from "../Spinner"

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

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data: User[] = await res.json();
        setUsers(data);
      } catch (err) {
        setError("Could not load users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, [])

  if (loading) return <div><Spinner/></div>;
    if (error) return <div>{error}</div>;
  

  return (
    <div className={styles.leftSidebar}>
      <SectionHeader text="Users" />
      <div className={styles.mainContent}>
        <div className={styles.users}>
          <Users users={users}/>
        </div>
        <div className={styles.chats}>

          <Chats initialChats={initialChats} session={session} activeChatId={activeChatId} users={users}/>
        </div>
      </div>
    </div>
  )
}