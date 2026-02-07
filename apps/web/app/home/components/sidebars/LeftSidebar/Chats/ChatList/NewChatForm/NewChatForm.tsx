"use client"

import { ReactEventHandler, useEffect, useRef, useState } from "react"
import styles from "./NewChatForm.module.css"
import { useNewChatForm } from "../../../../../../../../hooks/useNewChatForm"
import type { User } from "@ethos/shared"
import { FaSearch } from "react-icons/fa";
import Spinner from "../../../../../Spinner"
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
  const handleSubjectChange = (ev:any) => {
    if (ev.target.value.length > 21) return;
    setSubject(ev.target.value)
  }
  return (
    <>
      <div className={styles.newChatContainer}>
        <h1 className="flex justify-center pb-10">Create New Chat</h1>
        <form
          onSubmit={handleCreate}
          className={styles.newChatForm}
        >
          <div className={styles.newChatFields}>

            <div className={styles.chatSubject}>
              <label htmlFor="new-chat-subject-input">Subject (optional): </label>
              <input id="new-chat-subject-input" value={subject} onChange={handleSubjectChange} ref={chatSubjectRef} />
            </div>

            <div className={styles.selectedUsers}>
              {Array.from(selectedUsers.values()).map((user) => (
                <span key={user.id} className={styles.selectedUser}>
                  <button style={{ cursor: "pointer" }} onClick={() => handleSelectUsers(user)}><FaXmark size={18} /></button>
                  {user.username}
                </span>
              ))}
              {selectedUsers.size > 1 && <button type="button" onClick={() => setSelectedUsers(new Map())} className={styles.clearAllButton}>clear all</button>}
            </div>

            <div className="flex items-center">
              <label htmlFor="new-chat-users-search">Participants:</label>
              <div className={styles.usersSearch}>
                <input id="new-chat-users-search" placeholder="find a user..." onChange={(ev) => setQuery(ev.target.value)} value={query} />
                {query.length > 0
                  ? <button onClick={() => setQuery("")}><FaXmark className={`${styles.searchIcon} cursor-pointer`} size={18} /></button>
                  : <FaSearch className={styles.searchIcon} />}
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
                          {/* <button onClick={handleAddUsers} className={styles.addButton}>Add</button> */}
                        </div>
                        : "no users found"}
                    </div>}
                </div>}

              </div>
            </div>
          </div>
          <div className={styles.newChatButtons}>
            <button type="button" style={{ cursor: "pointer" }} onClick={handleCancel} className={styles.modalButton}>Cancel</button>
            <button type="submit" style={{ cursor: "pointer" }} className={styles.modalButton} disabled={selectedUsers.size === 0}>Create</button>
          </div>
        </form>
      </div>
    </>
  )
}