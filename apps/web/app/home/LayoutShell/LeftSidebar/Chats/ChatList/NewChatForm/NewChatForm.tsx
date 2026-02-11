"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./NewChatForm.module.css"
import { useNewChatForm } from "@/apps/web/hooks/useNewChatForm"
import type { User } from "@ethos/shared"
import { FaSearch } from "react-icons/fa";
import Spinner from "@/apps/web/app/home/components/Spinner"
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";



export default function NewChatForm({ allUsers, onCancel }: { allUsers: User[], onCancel: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [subject, setSubject] = useState("")
  const [selectedUsers, setSelectedUsers] = useState(new Map())
  const [query, setQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const {
    handleCancel,
    handleCreate,
  } = useNewChatForm(onCancel, subject, [...selectedUsers.keys()])

  const chatSubjectRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null)


  useEffect(() => {
    if (chatSubjectRef.current) {
      chatSubjectRef.current.focus();
    }
  }, []);


  useEffect(() => {
    function handleOutsideClick(ev: any) {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(ev.target)) {
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  useEffect(() => {
    if (!query) return
    setLoading(true)
    const t = setTimeout(() => getUsers(), 1000)
    return () => {
      setLoading(false)
      setFilteredUsers([])
      clearTimeout(t)
    }
  }, [query])

  const getUsers = async () => {
    try {
      const response = await fetch(`/api/users?query=${encodeURIComponent(query)}`)
      const data = await response.json()
      setFilteredUsers(data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleSelectUsers = (user: User) => {
    setSelectedUsers(prev => {
      const next = new Map(prev);
      next.has(user.id) ? next.delete(user.id) : next.set(user.id, user)
      return next
    })
  }
  const handleSubjectChange = (ev: any) => {
    if (ev.target.value.length > 21) return;
    setSubject(ev.target.value)
  }
  return (
    <>
      <section className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}> New Chat</h1>
        </header>

        <form onSubmit={handleCreate}>
          <div className={styles.fields}>

            <div className={styles.selectedUsers}>
              {Array.from(selectedUsers.values()).map((user) => (
                <span key={user.id} className={styles.selectedUser}>
                  <button style={{ cursor: "pointer" }} onClick={() => handleSelectUsers(user)}><FaXmark size={18} /></button>
                  {user.username}
                </span>
              ))}
              {selectedUsers.size > 1 && <button type="button" onClick={() => setSelectedUsers(new Map())} className={styles.clearAllButton}>clear all</button>}
            </div>

            <label className={styles.field}>
              <span className={styles.label}>Participants</span>
              <div className="relative flex items-center">
                <input
                  id="new-chat-users-search"
                  placeholder="find a user..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  ref={chatSubjectRef}
                  className={styles.input}
                />
                {query.length === 0 ?
                  <FaSearch className={styles.icon} /> :
                  <button className="flex items-center" onClick={() => setQuery("")}>
                    <FaXmark className={`${styles.icon} cursor-pointer`} size={18} />
                  </button>}
                {query.length > 0 && <div ref={dropdownRef} className={styles.dropdown}>
                  {loading
                    ? <div style={{ padding: "5px" }}><Spinner /></div>
                    : <div>
                      {filteredUsers.length > 0
                        ? <div>
                          {filteredUsers.map((user: User) => (
                            <div
                              onClick={() => handleSelectUsers(user)}
                              className={styles.dropdownItem}
                              key={user.id}
                            >
                              {user.username}
                              {selectedUsers.has(user.id) && <FaCheck color="lightgreen" />}
                            </div>
                          ))}
                        </div>
                        : "no users found"}
                    </div>}
                </div>}
              </div>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Subject (optional)</span>
              <input
                id="new-chat-subject-input"
                value={subject}
                onChange={handleSubjectChange}
                ref={chatSubjectRef}
                className={styles.input}
              />
            </label>









          </div>
          <div className={styles.buttons}>
            <button type="button" style={{ cursor: "pointer" }} onClick={handleCancel} className={styles.modalButton}>Cancel</button>
            <button type="submit" style={{ cursor: "pointer" }} className={styles.modalButton} disabled={selectedUsers.size === 0}>Create</button>
          </div>
        </form>
      </section>
    </>
  )
}