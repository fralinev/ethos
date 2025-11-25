import { useState, useEffect } from "react"

export const useNewChatForm = (setShowNewChatForm:any) => {
  const [chatName, setChatName] = useState("")
  const [participants, setParticipants] = useState("");

  const MAX_LENGTH = 15

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleCancel = () => {
    setShowNewChatForm(false)
    setChatName("");
    setParticipants("");
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const participantsArray = participants
      .split(',')
      .map(p => p.trim())
    const response = await fetch("/api/chats/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatName, participants: participantsArray }),
      credentials: "include"
    })
    if (!response.ok) {
      console.error("create chat error")
    }
    setShowNewChatForm(false)
    setChatName("");
    setParticipants("");
  }

  const handleChatNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const lowered = raw.toLowerCase()
    const cleaned = lowered.replace(/[^a-z]/g, "")
    const limited = cleaned.slice(0, MAX_LENGTH)
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
    handleCancel,
    handleCreate,
    handleChatNameChange,
    handlePartsChange
  }
}