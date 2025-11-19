// apps/web/hooks/useWebSocketClient.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { WebSocketClient } from "../lib/wsClient";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  // Stable instance
  const client = useMemo(() => WebSocketClient.getInstance(), []);

  useEffect(() => {
    // Attempt to connect on mount
    client.connect();

    const unsubscribeOpen = client.onOpen(() => {
      setIsConnected(true);
    });

    const unsubscribeClose = client.onClose(() => {
      setIsConnected(false);
    });

    return () => {
      unsubscribeOpen();
      unsubscribeClose();
      // We do NOT disconnect here; we let the singleton live across components.
    };
  }, [client]);

  return {
    client,
    isConnected,
    readyState: client.readyState,
  };
}
