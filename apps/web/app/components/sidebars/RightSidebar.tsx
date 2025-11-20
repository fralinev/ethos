"use client"
import { useEffect, useState } from "react"
import styles from "./styles.module.css"
import { useSocket } from "@/apps/web/hooks/useSocket"
import WsTestPage from "../../test/page"



export default function RightSidebar({ initialHealth }: { initialHealth: any }) {
  const [health, setHealth] = useState(null)
  const { client } = useSocket();

  useEffect(() => {
    
    const off = client.onMessage((msg) => {
      if (msg?.type === "health:update") {
        setHealth(msg.payload);
      }
    });
    return () => {
      off()
    }
      
  }, [client]);

  return (
    <div>
      <div className={styles.healthCheck}>
        healthCheck: {JSON.stringify(health)}
      </div>
      <div style={{width: "100%"}}>
        logs
        <WsTestPage/>
      </div>
    </div>
  )
}