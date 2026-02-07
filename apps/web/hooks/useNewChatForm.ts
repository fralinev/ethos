import { useState, useEffect } from "react"
import type { User } from "@ethos/shared"

export const useNewChatForm = (onCancel:React.Dispatch<React.SetStateAction<boolean>>, subject:string, userIds:string[] ) => {
  const [chatName, setChatName] = useState("")
  const [participants, setParticipants] = useState("");

  const MAX_LENGTH = 15

  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.key === "Escape") {
  //       handleCancel();
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  const handleCancel = () => {
    onCancel(false)
    // setChatName("");
    // setParticipants("");
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await fetch("/api/chats/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, userIds }),
      credentials: "include"
    })
    if (!response.ok) {
      console.error("create chat error")
    }
    onCancel(false)
    setChatName("");
    setParticipants("");
  }

  const handleChatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // const trimmed = raw.trim();
    // const lowered = raw.toLowerCase()
    // const cleaned = lowered.replace(/[^a-z]/g, "")
    const limited = raw.slice(0, MAX_LENGTH)
    setChatName(limited)
  }
  const handlePartsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const lowered = raw.toLowerCase()
    const cleaned = lowered.replace(/[^a-z,]/g, "")
    setParticipants(cleaned)
  }

  return {
    chatName,
    participants,
    setParticipants,
    handleCancel,
    handleCreate,
    handleChatNameChange,
    handlePartsChange
  }
}