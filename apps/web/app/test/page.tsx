"use client";

import { useEffect, useState } from "react";
import { useSocket } from "../../hooks/useSocket"


export default function WsTestPage() {
  const { client, isConnected, readyState } = useSocket();
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const offMsg = client.onMessage((data) => {
      setLog((prev) => [`← ${JSON.stringify(data)}`, ...prev]);
    });

    const offOpen = client.onOpen(() => {
      setLog((prev) => ["[open]", ...prev]);
    });

    const offClose = client.onClose((ev) => {
      setLog((prev) => [`[close ${ev.code} ${ev.reason}]`, ...prev]);
    });

    const offErr = client.onError(() => {
      setLog((prev) => ["[error]", ...prev]);
    });

    return () => {
      offMsg();
      offOpen();
      offClose();
      offErr();
    };
  }, [client]);

  const sendPing = () => {
    client.send({ type: "ping", payload: "hello from UI" });
    setLog((prev) => ["→ { type: 'ping', payload: 'hello from UI' }", ...prev]);
  };

  const disconnect = () => {
    client.disconnect(1000, "client disconnect");
  };

  const reconnect = () => {
    client.connect();
  };

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, sans-serif", width: "100%" }}>
      {/* <h1>WebSocket Test</h1>
      <p>
        Status:{" "}
        <strong>
          {isConnected ? "connected" : "disconnected"} (readyState {readyState})
        </strong>
      </p>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={sendPing} disabled={!isConnected}>
          Send ping
        </button>
        <button onClick={disconnect}>Disconnect</button>
        <button onClick={reconnect}>Reconnect</button>
      </div> */}
      <pre
        style={{
          width: "100%",  
          border: "1px solid #ccc",
          padding: 8,
          maxHeight: 300,
          overflow: "auto",
          fontSize: 12,
        }}
      >
        {log.join("\n")}
      </pre>
    </div>
  );
}
