import UsersList from "./UsersList/UsersList"
import UsersSearch from "./UsersSearch"
import styles from "./Users.module.css"
import { useState, useEffect } from "react"
import Spinner from "../../Spinner"

export type User = {
  id: string;
  username: string;
  created_at: string;
  role: string;
};

export default function Users({ allUsers }: { allUsers: User[] }) {
  const [query, setQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const displayUsers = query.trim().length > 0 ? filteredUsers : allUsers

  useEffect(() => {
    if (!query) return
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users?query=${encodeURIComponent(query)}`)
        const data = await response.json();
        setFilteredUsers(data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)

    }, 1000)
    return () => {
      setLoading(false)
      setFilteredUsers([])
      clearTimeout(t)
    }
  }, [query])



  return (
    <div className={styles.users}>
      {loading ? <Spinner/> : <UsersList users={displayUsers} />}
      <UsersSearch query={query} onSearch={setQuery} />
    </div>
  )
}