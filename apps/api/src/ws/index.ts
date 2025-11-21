import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import type { Store as SessionStore } from "express-session";

type SessionData = {
  user?: {
    id: string;
    username?: string;
  };
};

interface AuthedWebSocket extends WebSocket {
  user: SessionData["user"] | null;
}

type HealthPayload = {
  api: string;
  db: string;
  redis: string;
  ws: string;
};

// All sockets that care about health updates
const healthSubscribers = new Set<AuthedWebSocket>();

// Last known health snapshot (so new subscribers get something immediately)
let lastHealth: HealthPayload | null = null;

// One interval timer shared by all subscribers
let healthInterval: NodeJS.Timeout | null = null;

// Helper to call the Express /health endpoint
async function fetchHealthFromApi(): Promise<HealthPayload> {
  const res = await fetch(`${process.env.API_BASE_URL}/health`, {
    method: "GET",
    // node-fetch / undici don't really use this, but harmless:
    cache: "no-store" as any,
  });

  const data = await res.json();
  return data as HealthPayload;
}

function startHealthLoopIfNeeded() {
  // if we're already polling, or nobody cares, do nothing
  if (healthInterval || healthSubscribers.size === 0) return;

  console.log("[health] starting health loop");

  

  healthInterval = setInterval(async () => {
    try {
      const health = await fetchHealthFromApi();
      lastHealth = health;
    console.log("HEALTH INTERVAL", new Date(), health)


      // broadcast to all current subscribers
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
  }, 20_000); // e.g. every 10 seconds
}

function stopHealthLoopIfIdle() {
  if (healthSubscribers.size > 0) return;
  if (!healthInterval) return;

  console.log("[health] stopping health loop");
  clearInterval(healthInterval);
  healthInterval = null;
}

async function handleHealthSubscribe(socket: AuthedWebSocket) {
  // track this socket as someone who cares about health
  healthSubscribers.add(socket);

  // kick off the periodic loop if this is the first subscriber
  startHealthLoopIfNeeded();

  // if we already have a cached value, send it immediately
  if (lastHealth) {
    socket.send(
      JSON.stringify({
        type: "health:update",
        payload: lastHealth,
      })
    );
    return;
  }

  // otherwise, do a one-off fetch so the user doesn't wait for the first interval tick
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

  wss.on("connection", (ws, req) => {
    const socket = ws as AuthedWebSocket;
    socket.user = null;

    console.log("[ws] connection upgrade received", req.url);

    const sid = getSessionIdFromCookieHeader(req.headers.cookie);
    if (sid) {
      sessionStore.get(sid, (err, session) => {
        if (!err && session && (session as SessionData).user) {
          socket.user = (session as SessionData).user!;
          console.log("[ws] connected as authed user", socket.user.id);
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

      console.log("Express ws/index", data)

      switch (data.type) {
        case "health:subscribe":
          // handleHealthSubscribe(socket);
          break;
        case "logs:subscribe":
          sendInitialLogs(socket);
          break;
        case "chat:join":
          if (!socket.user) {
            socket.send(JSON.stringify({ type: "error", error: "unauthorized" }));
            return;
          }
          // handleChatJoin(socket, data.roomId);
          break;
        case "chat:send":
          if (!socket.user) {
            socket.send(JSON.stringify({ type: "error", error: "unauthorized" }));
            return;
          }
          // handleChatSend(socket, data.roomId, data.message);
          break;
        case "ping":
          socket.send(JSON.stringify({ type: "pong", payload: "hello from server" }))
        default:
          break;
      }
    });
    socket.on("close", () => {
      // remove from health subscribers (guest or authed, doesn’t matter)
      if (healthSubscribers.has(socket)) {
        healthSubscribers.delete(socket);
        stopHealthLoopIfIdle();
      }
    });
  });
}

async function sendInitialHealth(socket: AuthedWebSocket) {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/health`, {
      method: "GET",
      // no-store so you don't get a cached response in Render
      cache: "no-store" as any
    });

    const data = await res.json();

    socket.send(JSON.stringify({
      type: "health:update",
      payload: data, // <-- the real health object from Express
    }));
  } catch (err) {
    console.error("[ws] API health check failed:", err);

    socket.send(JSON.stringify({
      type: "health:update",
      payload: {
        api: "error",
        db: "unknown",
        redis: "unknown",
        ws: "ok",
      },
    }));
  }
}

// function sendInitialHealth(socket: AuthedWebSocket) {
//   socket.send(
//     JSON.stringify({
//       type: "health:update",
//       payload: {
//         api: "ok",
//         db: "ok",
//         redis: "ok",
//         ws: "ok",
//       },
//     })
//   );
// }

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
