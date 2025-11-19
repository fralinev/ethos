type MessageListener = (data: any, event: MessageEvent) => void;
type OpenListener = (event: Event) => void;
type CloseListener = (event: CloseEvent) => void;
type ErrorListener = (event: Event) => void;

type ListenerMap = {
  message: Set<MessageListener>;
  open: Set<OpenListener>;
  close: Set<CloseListener>;
  error: Set<ErrorListener>;
};

export type OutgoingMessage = {
  type: string;
  [key: string]: any;
};

export class WebSocketClient {
  private static _instance: WebSocketClient | null = null;

  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelayBaseMs = 500; // 0.5s, 1s, 2s, ...
  private manuallyClosed = false;
  private listeners: ListenerMap = {
    message: new Set(),
    open: new Set(),
    close: new Set(),
    error: new Set(),
  };

  private constructor(url: string) {
    this.url = url;
  }

  static getInstance(): WebSocketClient {
    if (!this._instance) {
      const url = process.env.NEXT_PUBLIC_WS_URL;
      if (!url) {
        throw new Error("NEXT_PUBLIC_WS_URL is not set");
      }
      this._instance = new WebSocketClient(url);
    }
    return this._instance;
  }

  /** Current readyState of the socket (or CLOSED if none) */
  get readyState(): number {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }

  /** Connect the socket (no-op if already open/connecting) */
  connect() {
    if (typeof window === "undefined") return; // SSR guard

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.manuallyClosed = false;
    const socket = new WebSocket(this.url);

    socket.addEventListener("open", (ev) => {
      this.socket = socket;
      this.reconnectAttempts = 0;
      this.listeners.open.forEach((fn) => fn(ev));
    });

    socket.addEventListener("message", (ev) => {
      let payload: any = ev.data;
      try {
        payload = JSON.parse(ev.data);
      } catch {
        // leave as raw string/binary
      }
      this.listeners.message.forEach((fn) => fn(payload, ev));
    });

    socket.addEventListener("error", (ev) => {
      this.listeners.error.forEach((fn) => fn(ev));
    });

    socket.addEventListener("close", (ev) => {
      this.listeners.close.forEach((fn) => fn(ev));

      this.socket = null;

      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    });

    this.socket = socket;
  }

  /** Close the socket and stop any auto-reconnect */
  disconnect(code?: number, reason?: string) {
    this.manuallyClosed = true;
    if (this.socket) {
      this.socket.close(code, reason);
      this.socket = null;
    }
  }

  /** Send a JSON-serializable message */
  send(message: OutgoingMessage) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open; cannot send", message);
      return;
    }
    this.socket.send(JSON.stringify(message));
  }

  /** Send raw data (string / ArrayBuffer / Blob) */
  sendRaw(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not open; cannot send raw", data);
      return;
    }
    this.socket.send(data);
  }

  /** Register event listeners; returns an unsubscribe function */
  onMessage(listener: MessageListener): () => void {
    this.listeners.message.add(listener);
    return () => {
      this.listeners.message.delete(listener);
    };
  }

  onOpen(listener: OpenListener): () => void {
    this.listeners.open.add(listener);
    return () => {
      this.listeners.open.delete(listener);
    };
  }

  onClose(listener: CloseListener): () => void {
    this.listeners.close.add(listener);
    return () => {
      this.listeners.close.delete(listener);
    };
  }

  onError(listener: ErrorListener): () => void {
    this.listeners.error.add(listener);
    return () => {
      this.listeners.error.delete(listener);
    };
  }

  /** Internal: schedule a reconnect with simple backoff */
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("Max WebSocket reconnect attempts reached");
      return;
    }

    this.reconnectAttempts += 1;
    const delay =
      this.reconnectDelayBaseMs * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`,
    );

    setTimeout(() => {
      if (!this.manuallyClosed) {
        this.connect();
      }
    }, delay);
  }
}
