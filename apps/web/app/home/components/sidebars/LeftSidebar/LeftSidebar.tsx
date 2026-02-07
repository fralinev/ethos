"use client"
import { SessionData } from "@ethos/shared"
import Chats from "./Chats/Chats"
import styles from "./LeftSidebar.module.css"
import type { Chat } from "@ethos/shared"
import SectionHeader from "../../SectionHeader"
import { useState, useEffect } from "react"
import Spinner from "../../Spinner"
import Users from "./Users"

export type User = {
  id: string;
  username: string;
  created_at: string;
  role: string;
};

export default function LeftSidebar({
  session,
  initialChats,
  activeChatId }: {
    session: SessionData | undefined,
    initialChats: Chat[],
    activeChatId: string | undefined
  }) {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([])


  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data: User[] = await res.json();
        setAllUsers(data);
      } catch (err) {
        setError("Could not load users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, [])



  if (loading) return <div><Spinner /></div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.leftSidebar}>
      {/* <SectionHeader text="Users" /> */}
      <Users allUsers={allUsers} />
      <Chats initialChats={initialChats} session={session} activeChatId={activeChatId} allUsers={allUsers} />
    </div>
  )
}