"use client"

import { useState } from "react"
import styles from "./NewChatForm.module.css"
import { useNewChatForm } from "@/apps/web/hooks/useNewChatForm"
import type { User } from "@ethos/shared"
import { FaSearch } from "react-icons/fa";
import Spinner from "@/apps/web/app/home/components/Spinner"
import { FaCheck } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";

export default function NewChatForm({ setIsCreatingNewChat }: { setIsCreatingNewChat: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [subject, setSubject] = useState<string>("")
  const [selectedUsers, setSelectedUsers] = useState<Map<string, User>>(new Map())

  const {
    handleCreate,
    searchRef,
    dropdownRef,
    query,
    setQuery,
    loading,
    filteredUsers
  } = useNewChatForm(setIsCreatingNewChat, subject, [...selectedUsers.keys()])

  const handleSelectUsers = (user: User) => {
    setSelectedUsers(prev => {
      const next = new Map(prev);
      next.has(user.id) ? next.delete(user.id) : next.set(user.id, user)
      return next
    })
  }
  const handleQueryChange = (e:any) => {
    if (e.target.value.length > 15) return;
    setQuery(e.target.value)

  }
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 21) return;
    setSubject(e.target.value)
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
                  <button
                    type="button"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSelectUsers(user)}>
                    <FaXmark size={18} />
                  </button>
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
                  onChange={handleQueryChange}
                  ref={searchRef}
                  className={styles.input}
                />
                {query.length === 0 ?
                  <FaSearch className={styles.icon} /> :
                  <button
                    type="button"
                    className="flex items-center"
                    onClick={() => setQuery("")}>
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

            {selectedUsers.size > 1 &&
              <label className={styles.field}>
                <span className={styles.label}>Subject (optional)</span>
                <input
                  id="new-chat-subject-input"
                  value={subject}
                  onChange={handleSubjectChange}
                  className={styles.input}
                />
              </label>}
          </div>
            <button type="button" style={{ cursor: "pointer" }} onClick={() => setIsCreatingNewChat(false)} className={styles.modalButton}>Cancel</button>
            <button type="submit" style={{ cursor: "pointer" }} className={styles.modalButton} disabled={selectedUsers.size === 0}>Create</button>
        </form>
      </section>
    </>
  )
}