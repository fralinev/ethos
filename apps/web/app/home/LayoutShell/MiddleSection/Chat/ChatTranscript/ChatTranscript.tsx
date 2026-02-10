
"use client"

import { AuthedSession } from "@ethos/shared";
import styles from "./ChatTranscript.module.css"
import Spinner from "../../../../components/Spinner";
import { useAppSelector } from "@/apps/web/store/hooks"

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
    </div>
  );
}
