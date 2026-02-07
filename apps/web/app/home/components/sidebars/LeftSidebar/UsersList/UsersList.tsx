"use client"
import styles from "./UsersList.module.css"

type User = {
  id: string;
  username: string;
  role: string;
  // rest
};

export default function UsersList({ users }: { users: User[] }) {

  return (

      <div className={`${styles.usersList} usersList`}>
        {users.map(user => (
          <div key={user.id}>
            {user.username}
          </div>
        ))}
      </div>
  )
}