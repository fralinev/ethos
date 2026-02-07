"use client"
import ChatToolbar from "./ChatToolbar/ChatToolbar"
import ChatTypingArea from "./ChatTypingArea/ChatTypingArea"

export default function ChatCommand({onSend}:any) {
  return (
    <>
      <ChatToolbar />
      <ChatTypingArea onSend={onSend}/>
    </>
  )
}