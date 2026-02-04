import UsersList from "./UsersList/UsersList"
import UsersSearch from "./UsersSearch"
import styles from "./Users.module.css"
import { useState, useEffect } from "react"
import Spinner from "../../Spinner"

export type User = {
  id: string;
  username: string;
  created_at: string;
};

export default function Users() {
  const [query, setQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([])

  useEffect(() => {
    const getUsers = async () => {
      console.log("getting all users")
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
  
  useEffect(() => {
    if (!query) return
    const t = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users?query=${encodeURIComponent(query)}`)
        const data = await response.json();
        setFilteredUsers(data)
      } catch (err) {
        console.error(err)
      }
    }, 3000)
    return () => clearTimeout(t)
  }, [query])


  if (loading) return <div><Spinner /></div>;
  if (error) return <div>{error}</div>;


  return (
    <div className={styles.users}>
      <UsersList allUsers={allUsers} />
      <UsersSearch query={query} onSearch={setQuery} />
    </div>
  )
}