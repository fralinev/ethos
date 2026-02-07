"use client";

import { useEffect, useRef, useState } from "react";

type MessageHandler = (data: any) => void;
type OpenHandler = () => void;
type CloseHandler = (ev: CloseEvent) => void;
type ErrorHandler = (ev: Event) => void;

type Status =
  | "idle"
  | "connecting"
  | "open"
  | "closed"
  | "reconnecting";

type SocketMessageToUI = {
  type: string;
  payload?: object;
  events?: [];
}

class SocketClient {
  private url: string;
  private socket: WebSocket | null = null;
  private status: Status = "idle";
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect: boolean = true;
  private messageHandlers = new Set<MessageHandler>();
  private openHandlers = new Set<OpenHandler>();
  private closeHandlers = new Set<CloseHandler>();
  private errorHandlers = new Set<ErrorHandler>();
  public activeChatId: string = "";

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.status === "open" || this.status === "connecting") return;
    this.status = "connecting"
    console.log("[ws] connecting")
    const socket = new WebSocket(this.url);
    this.socket = socket;
    this.shouldReconnect = true
    const current = socket;

    socket.onopen = () => {
      if (this.socket !== current) return;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      // if (this.activeChatId) {
      //   this.joinChat(this.activeChatId)
      // }
      console.log("[ws] connected")
      this.status = "open";
      this.reconnectAttempts = 0;
      this.openHandlers.forEach((fn) => fn());
    };

    socket.onmessage = (event) => {
      let data: SocketMessageToUI = event.data;
      try {
        data = JSON.parse(event.data);
        console.log("CHECK", this.activeChatId, data)
        if (data.type === "auth:ready" && this.activeChatId) {
        console.log("LOLOLOLOLOLOLOLO")

          this.joinChat(this.activeChatId)
        }
      } catch {
        // allow non-JSON messages too
      }
      this.messageHandlers.forEach((fn) => fn(data));
    };

    socket.onclose = (ev) => {
      if (this.socket !== current) return;
      this.status = "closed"
      console.log("[ws] closing")
      this.closeHandlers.forEach((fn) => fn(ev));
      if (this.shouldReconnect) {
        this.scheduleReconnect()
      }
    };

    socket.onerror = (ev) => {
      if (this.socket !== current) return;
      this.errorHandlers.forEach((fn) => fn(ev));
      socket.close()
    };
  }

  disconnect(code?: number, reason?: string) {
    if (this.socket) {
      this.shouldReconnect = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      this.socket.close(code, reason);
      this.socket = null;
      this.status = "idle"
    }
  }

  send(payload: { type: string, payload?: object }) {
    console.log("SEND", payload)
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    const data =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    this.socket.send(data);
  }

  get readyState(): number {
    return this.socket ? this.socket.readyState : WebSocket.CLOSED;
  }

  onMessage(handler: MessageHandler): () => void {
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

  scheduleReconnect() {
    if (this.status === "reconnecting") return;
    this.status = "reconnecting";
    this.reconnectAttempts++
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 15000);
    console.log(`[ws] reconnecting in ${delay}ms`);
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  // setActiveChatId(chatId: string) {
  //   this.activeChatId = chatId
  // }

  joinChat(chatId: string) {
    this.activeChatId = chatId
    console.log("JOIN CHAT", this.activeChatId)
    this.send({ type: "chat:join", payload: { chatId } })
  }
  exitChat(chatId: string) {
    if (this.activeChatId === chatId) {
      this.activeChatId = ""
    }
    this.send({ type: "chat:exit", payload: { chatId } })
  }
}

let sharedClient: SocketClient | null = null;

function getSocketClient(): SocketClient {
  if (!sharedClient) {
    let url = process.env.NEXT_PUBLIC_WS_URL;
    sharedClient = new SocketClient(url as string);
  }
  return sharedClient;
}

export function useSocket() {
  const client = getSocketClient();
  const [isConnected, setIsConnected] = useState(false);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

  useEffect(() => {

    client.connect();

    const offOpen = client.onOpen(() => {
      setIsConnected(true);
      setReadyState(client.readyState);
      // client.send({ type: "health:subscribe" });
      // client.send({ type: "logs:subscribe" });
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
    };
  }, [client]);

  return {
    client,
    isConnected,
    readyState,
  };
}
