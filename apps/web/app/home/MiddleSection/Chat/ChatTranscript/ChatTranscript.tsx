
"use client"

import { useState, useEffect } from "react";
import { AuthedSession } from "@ethos/shared";
import ChatTypingArea from "../ChatCommand/ChatTypingArea/ChatTypingArea";
import { useSocket } from "@/apps/web/hooks/useSocket";
import styles from "./ChatTranscript.module.css"
import Spinner from "../../../components/Spinner";
import { useAppSelector } from "../../../../../store/hooks";
import { startChatLoading, finishChatLoading } from "@/apps/web/store/slices/chatSlice"
import { useAppDispatch } from "@/apps/web/store/hooks";
import type { ChatMessage, ServerMessage } from "@ethos/shared"


export default function ChatTranscript({
  messages
}: {
  session: AuthedSession,
  activeChatId?: string,
  messages: any,
}) {

  const isChatLoading = useAppSelector((s) => s.ui.isChatLoading);
  
  return (
    <div id="transcript-container" className={styles.transcriptContainer}>
      {isChatLoading
        ? <Spinner size={60} />
        : <div className={styles.messagesArea}>
          {messages.length === 0 ? (
            <div>No messages yet in this chat.</div>
          ) : (
            <ul style={{ padding: "20px" }}>
              {messages.map((m: any) => (
                <li key={m.id ?? m.clientId}>
                  <strong>{m.sender.username}</strong>: {m.body}{" "}
                </li>
              ))}
            </ul>
          )}
        </div>}

      {/* <ChatTypingArea onSend={onSend} /> */}
    </div>
  );
}
