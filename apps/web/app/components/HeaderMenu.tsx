"use client"
import { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";

export default function HeaderMenu({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";  // full reload
  }
  const deleteUser = (session:any) => {
    console.log("deleting user...")
  }
  return (
    <>
      <div className="relative" onClick={() => setIsOpen(!isOpen)}>
        <GiHamburgerMenu size={30} />

      </div>
      {isOpen && <div className="absolute right-9 top-10 bg-gray-400">
        <ul className="flex flex-col p-4 gap-2">
          <li className="border-b border-lime-500" onClick={handleLogout}>Logout</li>
          <li className="border-b border-lime-500" onClick={deleteUser}>Profile</li>
        </ul>
      </div>}
    </>
  )
}