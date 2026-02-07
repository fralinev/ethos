"use client"
import { GrFormClose } from "react-icons/gr";

export default function ChatHeader({ text, onClose }: any) {

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      backgroundColor: "rgb(28, 31, 35)",
      padding: "12px 20px",
      width: "100%"
    }}>
      <div>{text}</div>
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