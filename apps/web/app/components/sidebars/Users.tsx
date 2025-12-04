"use client"
import { useEffect, useState } from "react";
import Spinner from "../Spinner";

type User = {
  id: string;
  username: string;
  // rest
};

export default function Users({users}:{users:User[]}) {
  // const [users, setUsers] = useState<User[]>([])
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const getUsers = async () => {
  //     try {
  //       setLoading(true)
  //       const res = await fetch("/api/users");
  //       if (!res.ok) throw new Error("Failed to fetch users");
  //       const data: User[] = await res.json();
  //       setUsers(data);
  //     } catch (err) {
  //       setError("Could not load users");
  //       console.error(err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   getUsers();
  // }, [])

  // if (loading) return <div><Spinner/></div>;
  // if (error) return <div>{error}</div>;

  return (
    <div>
      
      <div style={{padding: "10px"}}>
        {users.map(user => (
          <div key={user.id}>
            {user.username}
          </div>
        ))}
      </div>
    </div>
  )
}