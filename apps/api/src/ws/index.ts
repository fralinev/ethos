// apps/api/src/websocket.ts
import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import type { Store as SessionStore } from "express-session";

type SessionData = {
  user?: {
    id: string;
    username: string;
    // whatever else you store
  };
};

interface AuthedWebSocket extends WebSocket {
  user: SessionData["user"] | null;
}

function getSessionIdFromCookieHeader(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sidCookie = cookies.find((c) => c.startsWith("connect.sid="));
  if (!sidCookie) return null;

  const raw = decodeURIComponent(sidCookie.split("=").slice(1).join("="));

  // express-session signed cookie format: s:<sid>.<signature>
  if (raw.startsWith("s:")) {
    const unsigned = raw.slice(2);
    const dotIndex = unsigned.indexOf(".");
    return dotIndex === -1 ? unsigned : unsigned.slice(0, dotIndex);
  }

  return raw;
}

export function createWebSocketServer(httpServer: HttpServer, sessionStore: SessionStore) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const socket = ws as AuthedWebSocket;
    socket.user = null;

    const sid = getSessionIdFromCookieHeader(req.headers.cookie);
    if (sid) {
      sessionStore.get(sid, (err, session) => {
        if (!err && session && (session as SessionData).user) {
          socket.user = (session as SessionData).user!;
          console.log("[ws] connected as authed user", socket.user.username);
        } else {
          console.log("[ws] connected as guest (session miss)");
        }
      });
    } else {
      console.log("[ws] connected as guest (no cookie)");
    }

    socket.on("message", (raw) => {
      let data: any;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }

      switch (data.type) {
        case "health:subscribe": {
          sendInitialHealth(socket);
          break;
        }
        case "logs:subscribe": {
          sendInitialLogs(socket);
          break;
        }
        case "chat:join": {
          if (!socket.user) {
            socket.send(JSON.stringify({ type: "error", error: "unauthorized" }));
            return;
          }
          handleChatJoin(socket, data.roomId);
          break;
        }
        case "chat:send": {
          if (!socket.user) {
            socket.send(JSON.stringify({ type: "error", error: "unauthorized" }));
            return;
          }
          handleChatSend(socket, data.roomId, data.message);
          break;
        }
        default:
          break;
      }
    });

    socket.on("close", () => {
      // cleanup if you want
    });
  });

  return wss;
}

// your existing stubs:
function sendInitialHealth(socket: AuthedWebSocket) {
  socket.send(
    JSON.stringify({
      type: "health:update",
      payload: {
        api: "ok",
        db: "ok",
        redis: "ok",
        ws: "ok",
      },
    })
  );
}

function sendInitialLogs(socket: AuthedWebSocket) {
  socket.send(
    JSON.stringify({
      type: "logs:init",
      events: [
        { level: "info", message: "Welcome to Ethos" },
        { level: "info", message: "Connected to live telemetry" },
      ],
    })
  );
}

function handleChatJoin(socket: AuthedWebSocket, roomId: string) {
  console.log("[ws] user", socket.user?.id, "joined room", roomId);
}

function handleChatSend(socket: AuthedWebSocket, roomId: string, message: string) {
  console.log("[ws] message from", socket.user?.id, "in", roomId, ":", message);
}
