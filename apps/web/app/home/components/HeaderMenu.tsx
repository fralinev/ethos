"use client"
import { useState, useRef, useEffect } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import styles from "./HeaderMenu.module.css"

export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleOutsideClick(ev: MouseEvent) {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(ev.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  },[])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";  // full reload
  }
  const handleProfile = () => {
    // add logic
  }

  return (
    <>
      <div className={styles.headerMenuTrigger} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.headerMenuButton}>
          <GiHamburgerMenu size={22} />
        </div>
      </div>
      {isOpen && <div ref={dropdownRef} className={styles.headerMenuDropdown}>
        <ul className={styles.headerMenuList}>
          <li className={styles.headerMenuItem} onClick={handleLogout}>Logout</li>
          <li className={styles.headerMenuItem} onClick={handleProfile}>Profile</li>
        </ul>
      </div>}
    </>
  )
}