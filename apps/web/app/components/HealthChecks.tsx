"use client"
import SectionHeader from "./SectionHeader"
import { useEffect, useState } from "react"
import { useSocket } from "../../hooks/useSocket"
import styles from "./HealthChecks.module.css"

type HealthCheck = {
  api: string;
  db: string;
  redis: string;
  ws: string;
}

export default function HealthChecks() {
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const { client, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;
    client.send({ type: "health:subscribe" });
    const off = client.onMessage((msg) => {
      if (msg?.type === "health:update") {
        setHealth(msg.payload);
      }
    });
    return () => {
      off()
    }
  }, [client, isConnected]);

  return (
    <div style={{height: "100%"}}>
      <SectionHeader text="Health Checks"/>
      <div className={styles.servicesContainer}>
        <div>{`Express API: ${health?.api}`}</div>
        <div>{`Postgres DB: ${health?.db}`}</div>
        <div>{`Redis Cache: ${health?.redis}`}</div>
        <div>{`WebSocket: ${health?.ws}`}</div>
      </div>
    </div>
  )
}