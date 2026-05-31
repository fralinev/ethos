"use client"

import { useState, useRef, useEffect } from "react"
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
  const [chipHeight, setChipHeight] = useState(0)

  const {
    handleCreate,
    searchRef,
    dropdownRef,
    query,
    setQuery,
    loading,
    filteredUsers,
    message
  } = useNewChatForm(setIsCreatingNewChat, subject, [...selectedUsers.keys()], selectedUsers)

  const chipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chipRef.current) return;

    const el = chipRef.current;
    const updateHeight = () => {
      const next = Math.ceil(el.getBoundingClientRect().height);
      setChipHeight(next);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.unobserve(el);
      resizeObserver.disconnect();
    };
  }, []);


  const handleSelectUsers = (user: User) => {
    setSelectedUsers(prev => {
      const next = new Map(prev);
      next.has(user.id) ? next.delete(user.id) : next.set(user.id, user)
      return next
    })
  }
  const handleQueryChange = (e: any) => {
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






            <span className={styles.label} style={{margin: "0 0 20px 0", color: selectedUsers.size > 6 ? "red" : "white"}}>{`Participants (${selectedUsers.size}/6)`}</span>



            {/* <label className={styles.field}> */}

            <div style={{ paddingTop: chipHeight }} className={`${styles.wrapper} relative flex items-center`}>




              <div ref={chipRef} className={styles.selectedUsers}>
                {Array.from(selectedUsers.values()).map((user) => (
                  <span key={user.id} className={styles.selectedUser}>
                    <button
                      type="button"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSelectUsers(user)}
                    >
                      <FaXmark size={18} />
                    </button>
                    {user.username}
                  </span>
                ))}
                {/* {selectedUsers.size > 1 && <button type="button" onClick={() => setSelectedUsers(new Map())} className={styles.clearAllButton}>clear all</button>} */}
              </div>
              <div style={{position: "relative", margin: "0 0 20px 0"}}>

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
              {/* </label> */}
            </div>
          </div>

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
          <button type="button" style={{ cursor: "pointer" }} onClick={() => setIsCreatingNewChat(false)} className={styles.modalButton}>Cancel</button>
          <button type="submit" style={{ cursor: "pointer" }} className={styles.modalButton} disabled={selectedUsers.size === 0}>Create</button>
        </form>
        {message && <div className={styles.errorText}>{message}</div>}
      </section>
    </>
  )
}