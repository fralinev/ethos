"use client";

import SectionHeader from "./SectionHeader";
import { useEffect, useState } from "react";
import { useSocket } from "../../../hooks/useSocket";
import styles from "./HealthChecks.module.css";
import clsx from "clsx";

type HealthStatus = "ok" | "assume ok" | "error";

type HealthCheck = {
  api: HealthStatus;
  db: HealthStatus;
  redis: HealthStatus;
  ws: HealthStatus;
};

const SERVICES: { key: keyof HealthCheck; label: string }[] = [
  { key: "api", label: "Express API" },
  { key: "db", label: "Postgres DB" },
  { key: "redis", label: "Redis Cache" },
  { key: "ws", label: "WebSocket" },
];

const getStatusClass = (status?: HealthStatus) => {
  switch (status) {
    case "ok":
      return styles.ok;
    case "assume ok":
      return styles.assumeOK;
    case "error":
    default:
      return styles.error;
  }
};

export default function HealthChecks() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const { client, isConnected } = useSocket();

  useEffect(() => {
    if (!client || !isConnected) return;

    client.send({ type: "health:subscribe" });

    const off = client.onMessage((msg) => {
      if (msg?.type === "health:update") {
        setHealth(msg.payload);
      }
    });

    return () => {
      off();
    };
  }, [client, isConnected]);

  return (
    <div style={{ height: "100%" }}>
      <SectionHeader text="Health Checks" />

      <div className={styles.outer}>
        <div className={styles.container}>
          {SERVICES.map(({ key, label }) => (
            <div key={key} className={styles.row}>
              <div className={styles.serviceName}>{label}</div>
              <div className={styles.indicator}>
                <div
                  className={clsx(
                    styles.healthDot,
                    getStatusClass(health?.[key])
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
