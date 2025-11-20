"use client";

import { useEffect, useRef, useState } from "react";

type MessageHandler = (data: any) => void;
type OpenHandler = () => void;
type CloseHandler = (ev: CloseEvent) => void;
type ErrorHandler = (ev: Event) => void;

class SocketClient {
  private url: string;
  private ws: WebSocket | null = null;

  private messageHandlers = new Set<MessageHandler>();
  private openHandlers = new Set<OpenHandler>();
  private closeHandlers = new Set<CloseHandler>();
  private errorHandlers = new Set<ErrorHandler>();

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.onopen = () => {
      this.openHandlers.forEach((fn) => fn());
    };

    ws.onmessage = (event) => {
      let data: any = event.data;
      try {
        data = JSON.parse(event.data);
      } catch {
        // allow non-JSON messages too
      }
      this.messageHandlers.forEach((fn) => fn(data));
    };

    ws.onclose = (ev) => {
      this.closeHandlers.forEach((fn) => fn(ev));
    };

    ws.onerror = (ev) => {
      this.errorHandlers.forEach((fn) => fn(ev));
    };
  }

  disconnect(code?: number, reason?: string) {
    if (this.ws) {
      this.ws.close(code, reason);
      this.ws = null;
    }
  }

  send(payload: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const data =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    this.ws.send(data);
  }

  get readyState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onOpen(handler: OpenHandler) {
    this.openHandlers.add(handler);
    return () => this.openHandlers.delete(handler);
  }

  onClose(handler: CloseHandler) {
    this.closeHandlers.add(handler);
    return () => this.closeHandlers.delete(handler);
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }
}

export function useSocket() {
  const clientRef = useRef<SocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

  if (!clientRef.current) {
    let url = process.env.NEXT_PUBLIC_WS_URL;
    if (!url) {
      if (process.env.NODE_ENV === "development") {
        url = "ws://localhost:4000/ws";
      } else {
        throw new Error("NEXT_PUBLIC_WS_URL is not set in production");
      }
    }
    clientRef.current = new SocketClient(url);
  }

  useEffect(() => {
    const client = clientRef.current!;
    client.connect();

    const offOpen = client.onOpen(() => {
      setIsConnected(true);
      setReadyState(client.readyState);
      // subscribe to telemetry for every connection
      client.send({ type: "health:subscribe" });
      client.send({ type: "logs:subscribe" });
    });

    const offClose = client.onClose(() => {
      setIsConnected(false);
      setReadyState(client.readyState);
    });

    const offMsg = client.onMessage(() => {
      setReadyState(client.readyState);
    });

    const offErr = client.onError(() => {
      setReadyState(client.readyState);
    });

    return () => {
      offOpen();
      offClose();
      offMsg();
      offErr();
      client.disconnect(1000, "unmount");
    };
  }, []);

  return {
    client: clientRef.current!,
    isConnected,
    readyState,
  };
}
