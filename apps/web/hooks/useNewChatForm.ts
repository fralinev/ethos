import { useState } from "react"
import { apiFetch } from "../lib/apiFetch";

export const useNewChatForm = (onCancel:React.Dispatch<React.SetStateAction<boolean>>, subject:string, userIds:string[] ) => {

  const handleCancel = () => {
    onCancel(false)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const chatDTO = await apiFetch("/api/chats/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, userIds }),
    })
    onCancel(false)
  }
 

  return {
    handleCancel,
    handleCreate,
  }
}