import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import type { Store as SessionStore } from "express-session";
import { registerWss, registerUserSocket, unregisterUserSocket, registerChatSocket, unregisterChatSocket } from "./hub";
import { SessionData, HealthPayload } from "@ethos/shared"



export type AuthedWebSocket = WebSocket & {
  user: SessionData["user"] | null;
  chatId?: string
}

const healthSubscribers = new Set<AuthedWebSocket>();

let lastHealth: HealthPayload | null = null;

let healthInterval: NodeJS.Timeout | null = null;

async function fetchHealthFromApi(): Promise<HealthPayload> {
  const res = await fetch(`${process.env.API_BASE_URL}/health`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json();
  return data as HealthPayload;
}

function startHealthLoopIfNeeded() {
  if (healthInterval || healthSubscribers.size === 0) return;

  healthInterval = setInterval(async () => {
    try {
      const health = await fetchHealthFromApi();
      lastHealth = health;

      for (const socket of healthSubscribers) {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "health:update",
              payload: health,
            })
          );
        } else {
          // clean up dead sockets
          healthSubscribers.delete(socket);
        }
      }
    } catch (err) {
      console.error("[health] periodic health check failed:", err);
    }
  }, 15_000);
}

function stopHealthLoopIfIdle() {
  if (healthSubscribers.size > 0) return;
  if (!healthInterval) return;

  console.log("[health] stopping health loop");
  clearInterval(healthInterval);
  healthInterval = null;
}

async function handleHealthSubscribe(socket: AuthedWebSocket) {
  healthSubscribers.add(socket);
  startHealthLoopIfNeeded();
  if (lastHealth) {
    socket.send(
      JSON.stringify({
        type: "health:update",
        payload: lastHealth,
      })
    );
    return;
  }
  try {
    const health = await fetchHealthFromApi();
    lastHealth = health;

    socket.send(
      JSON.stringify({
        type: "health:update",
        payload: health,
      })
    );
  } catch (err) {
    console.error("[health] initial health check failed:", err);
    socket.send(
      JSON.stringify({
        type: "health:update",
        payload: {
          api: "error",
          db: "unknown",
          redis: "unknown",
          ws: "ok",
        },
      })
    );
  }
}



function getSessionIdFromCookieHeader(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sidCookie = cookies.find((c) => c.startsWith("connect.sid="));
  if (!sidCookie) return null;

  const raw = decodeURIComponent(sidCookie.split("=").slice(1).join("="));

  if (raw.startsWith("s:")) {
    const unsigned = raw.slice(2);
    const dotIndex = unsigned.indexOf(".");
    return dotIndex === -1 ? unsigned : unsigned.slice(0, dotIndex);
  }

  return raw;
}

export function createWebSocketServer(httpServer: HttpServer, sessionStore: SessionStore) {

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  registerWss(wss);

  wss.on("connection", (ws, req) => {
    const socket = ws as AuthedWebSocket;
    socket.user = null;

    const sid = getSessionIdFromCookieHeader(req.headers.cookie);
    if (sid) {
      sessionStore.get(sid, (err, session) => {

        if (!err && session && (session as SessionData).user) {
          socket.user = (session as SessionData).user!;
          console.log("[ws] connected as authed user", socket.user.id);
          registerUserSocket(socket.user.id, socket);
          socket.send(JSON.stringify({ type: "auth:ready" }))

        } else {
          console.log("[ws] connected as guest (session miss)");
        }
      });
    } else {
      console.log("[ws] connected as guest (no cookie)");

    }

    socket.on("message", (raw) => {

      let data: { type: string, payload?: Record<string, unknown> };
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }
      switch (data.type) {
        case "health:subscribe":
          handleHealthSubscribe(socket);
          break;
        case "logs:subscribe":
          sendInitialLogs(socket);
          break;
        case "chat:join":
          if (!socket.user) {
            socket.send(JSON.stringify({ type: "error", error: "unauthorized" }));
            return;
          }
          // TS guard
          if (typeof data.payload?.chatId === "string") {
            if (socket.chatId) {
              unregisterChatSocket(socket)
            }
            socket.chatId = data.payload.chatId;
            registerChatSocket(data.payload.chatId, socket)
          }
          break;
        case "chat:exit":
          unregisterChatSocket(socket)
          delete socket.chatId
          break;
        case "chat:send":
          if (!socket.user) {
            socket.send(JSON.stringify({ type: "error", error: "unauthorized" }));
            return;
          }
          break;
        case "chat:typing":
          console.log("chat typing")

        case "ping":
          socket.send(JSON.stringify({ type: "pong", payload: "hello from server" }))
        default:
          break;
      }
    });
    socket.on("close", () => {
      if (healthSubscribers.has(socket)) {
        healthSubscribers.delete(socket);
        stopHealthLoopIfIdle();
      }
      unregisterUserSocket(socket);
      unregisterChatSocket(socket);
    });
  });
}

function sendInitialLogs(socket: AuthedWebSocket) {
  socket.send(
    JSON.stringify({
      type: "logs:init",
      events: [
        { level: "info", message: "Welcome to Ethos! Connected to live telemetry" },
      ],
    })
  );
}
