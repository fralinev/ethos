"use client"

import UsersList from "./UsersList/UsersList"
import styles from "./Users.module.css"
import { useQuery } from "@tanstack/react-query"
import type {User} from "@ethos/shared"

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users")
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export default function Users({ initialUsers }: { initialUsers: User[] }) {
 
const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    initialData: initialUsers,
  })

  return (
    <div className={styles.users}>
      <UsersList users={users} />
    </div>
  )
}