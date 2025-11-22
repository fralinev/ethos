"use client"
import { useEffect, useState } from "react";

type User = {
  id: string;
  username: string;
  // rest
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUsers = async () => {
      try {
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

  if (loading) return <div>Loading users…</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div>
        Users
      </div>
      <div>
        {users.map(user => (
          <div key={user.id}>
            {user.username}
          </div>
        ))}
      </div>
    </div>
  )
}