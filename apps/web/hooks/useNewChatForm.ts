import { apiFetch } from "../lib/apiFetch";
import { useEffect, useRef, useState } from "react";
import type { User } from "@ethos/shared"
import { HttpError } from "@ethos/shared"

export const useNewChatForm = (setIsCreatingNewChat: React.Dispatch<React.SetStateAction<boolean>>, subject: string, userIds: string[]) => {
  const [query, setQuery] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  const searchRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const requestSeqRef = useRef(0)

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(e.target as Node)) {
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  useEffect(() => {
    if (!query) {
      requestSeqRef.current += 1
      setLoading(false)
      setFilteredUsers([])
      return
    }
    setLoading(true)
    const controller = new AbortController()
    const requestId = ++requestSeqRef.current

    const t = setTimeout(async () => {
      try {
        const data: User[] = await apiFetch(
          `/api/users?query=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        )
        if (requestId !== requestSeqRef.current) return
        setFilteredUsers(data)
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (err instanceof HttpError && err.status === 401) {
          window.location.href = "/";
        } else {
          console.error(err)
        }
      } finally {
        if (requestId === requestSeqRef.current) {
          setLoading(false)
        }
      }
    }, 300)

    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [query])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("handleCreate", userIds)
    e.preventDefault();
    const { newChat } = await apiFetch("/api/chats/create", {
      method: "POST",
      body: JSON.stringify({ subject, userIds }),
    })
    setIsCreatingNewChat(false)
  }


  return {
    searchRef,
    dropdownRef,
    handleCreate,
    query,
    setQuery,
    loading,
    filteredUsers
  }
}