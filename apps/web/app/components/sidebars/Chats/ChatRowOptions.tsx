"use client"

export default function ChatRowOptions({chat, onDelete}:any) {
  return (
    <div
    // style={{position: "relative"}}
    >
      <div
        style={{ position: "absolute", background: "black", padding: "20px" }}
      >
        <div>Rename</div>
        <div style={{cursor: "pointer"}} onClick={() => onDelete(chat)}>Delete</div>
      </div>
    </div>
  )
}