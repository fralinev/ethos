"use client"
import SectionHeader from "./SectionHeader"
import { useEffect, useState } from "react"
import { useSocket } from "../../hooks/useSocket"
import styles from "./Logger.module.css"


type EventLog = {
  level: string;
  message: string;
  user?: string,
  chat?: string
  newChat?: string;
}

export default function Logger() {
  const [logs, setLogs] = useState<EventLog[]>([])

  const { client, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;
    client.send({ type: "logs:subscribe" });
    const off = client.onMessage((message) => {
      if (message?.type === "logs:event" || message?.type === "logs:init") {
        setLogs((prev: EventLog[]) => [...message.events, ...prev]);
      }
      if (message?.type === "chat:created") {
        const log: EventLog = {
          level: message.type,
          user: message.payload.createdBy.username,
          chat: message.payload.name,
          message: ""
        }
        setLogs((prev: EventLog[]) => [log, ...prev])
      }
      if (message?.type === "chat:deleted") {
        const log: EventLog = {
          level: message.type,
          user: message.payload.deletedBy,
          chat: message.payload.name,
          message: ""
        }
        setLogs((prev: EventLog[]) => [log, ...prev])
      }
      if (message?.type === "chat:renamed") {
        const log: EventLog = {
          level: message.type,
          user: message.payload.renamedBy,
          chat: message.payload.oldName,
          newChat: message.payload.newName,
          message: ""
        }
        setLogs((prev: EventLog[]) => [log, ...prev])
      }
    });
    return () => {
      off()
    }
  }, [client, isConnected]);

  const formatChatCreatedLog = (log: EventLog, i: number) => {
    return (
      <div key={i}>User {" "}
        <span style={{ color: "lightblue" }}>{log.user}{" "}</span>
        created chat {" "}
        <span style={{ color: "lightgreen" }}>{log.chat}</span>
      </div>
    )
  }
  const formatChatDeletedLog = (log: EventLog, i: number) => {
    return (
      <div key={i}>User {" "}
        <span style={{ color: "lightblue" }}>{log.user}{" "}</span>
        deleted chat {" "}
        <span style={{ color: "red" }}>{log.chat}</span>
      </div>
    )
  }
  const formatChatRenamedLog = (log: EventLog, i: number) => {
    return (
      <div key={i}>User {" "}
        <span style={{ color: "lightblue" }}>{log.user}{" "}</span>
        renamed chat {" "}
        <span style={{ color: "violet" }}>{log.chat}{" "}</span>
        to {" "}
        <span style={{color: "lightgreen"}}>{log.newChat}</span>
      </div>
    )
  }


  return (
    <div className={styles.loggerComponentWrapper}>
      <SectionHeader text="Logger" />
      <div className={styles.outputContainer}>
        {logs.map((log: EventLog, i: number) => {
          if (log.level === "chat:created") {
            return formatChatCreatedLog(log, i)
          }
          if (log.level === "chat:deleted") {
            return formatChatDeletedLog(log, i)
          }
          if (log.level === "chat:renamed") {
            return formatChatRenamedLog(log, i)
          }
          return <div key={i}>{log.message}</div>
        })}


      </div>
    </div>
  )
}