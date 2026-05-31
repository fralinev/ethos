"use client"
import { GrFormClose } from "react-icons/gr";
import { getUsernames } from "@/apps/web/lib/utils";
import { useUser } from "@/apps/web/app/context/UserContext";
export default function ChatHeader({ text, onClose, activeChat }: any) {
  const user = useUser();
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      backgroundColor: "rgb(28, 31, 35)",
      padding: "12px 20px",
      width: "100%"
    }}>
      <div>{activeChat.subject ? activeChat.subject : getUsernames(activeChat.members, user.id)}</div>
      {onClose &&
        <div
          onClick={onClose}
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <GrFormClose />
        </div>}
    </div>

  )
}