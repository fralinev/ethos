"use client"


export default function Users() {
  const tempGetUsers = async () => {
    const res = await fetch("/api/users")
    const data = await res.json();
    console.log("users data", data)
  }
  return (
    <div>
      <div>
        Users
      </div>
      <button onClick={tempGetUsers}>getUsers</button>
    </div>
  )
}