"use client"
import styles from "./AddUsersDropdown.module.css"
import type { User } from "@ethos/shared"
import { FaCheck } from "react-icons/fa";

export default function AddUsersDropdown({
  allUsers,
  selectedUsers,
  setSelectedUsers,
  handleCreate
}: {
  allUsers: User[],
  selectedUsers: User[],
  setSelectedUsers: React.Dispatch<React.SetStateAction<User[]>>,
  handleCreate:any

}) {

  const handleAddClick = (e: React.MouseEvent<HTMLDivElement>, user: User) => {
    if (selectedUsers.find(({ username }) => username === user.username)) {
      setSelectedUsers((prev) => {
        return prev.filter(({ username }) => username !== user.username)
      })
    } else {
      setSelectedUsers((prev) => {
        return [...prev, user]
      })
    }
  }

  return (
    <div className={styles.wrapper}>
      {allUsers.map((u) => {
        return (
          <div key={u.id} className={styles.row}>

            <div className={styles.username}>
              {u.username}
            </div>
            <div onClick={(e) => handleAddClick(e, u)} className={styles.add}>
              {selectedUsers.find(({ username }) => username === u.username) ? <FaCheck color="lightgreen" /> : "Add"}
            </div>
          </div>
        )
      })}
      <div className={styles.done} onClick={handleCreate}>Done</div>
    </div>
  )
}