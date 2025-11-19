// apps/api/src/ws/index.ts
import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";

interface SessionData {
  user?: {
    id: string;
    username: string;
  };
}

export interface AuthedRequest extends IncomingMessage {
  sessionID?: string;
  session?: SessionData;
}

export interface AuthedWebSocket extends WebSocket {
  user?: SessionData["user"];
}

export function initWebsocketServer() {
  // noServer: true → we will hook this up in server.ts
  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", (ws: AuthedWebSocket, req: AuthedRequest) => {
    console.log("WS raw cookies:", req.headers.cookie);
    console.log("WS session on connect:", {
      id: req.sessionID,
      user: req.session?.user,
    });

    if (!req.session?.user) {
      console.log("WS unauthorized, closing");
      ws.close(1008, "Unauthorized");
      return;
    }

    ws.user = req.session.user;
    console.log("WS connected for user:", ws.user);

    ws.on("message", (msg) => {
      console.log(`WS message from ${ws.user?.username}:`, msg.toString());
      ws.send(`pong from server, user=${ws.user?.username}`);
    });

    ws.on("close", () => {
      console.log("WS: client disconnected", ws.user);
    });

    ws.on("error", (err) => {
      console.error("WS error:", err);
    });
  });

  console.log("WebSocket server initialized with session support");

  return wss;
}
