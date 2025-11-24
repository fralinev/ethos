// api/src/ws/wsHub.ts
import type { WebSocketServer } from "ws";
import WebSocket from "ws";
import type { AuthedWebSocket } from ".";

let wssGlobal: WebSocketServer | null = null;

// userId -> Set of sockets
const userSockets = new Map<number, Set<AuthedWebSocket>>();

export function registerWss(instance: WebSocketServer) {
  wssGlobal = instance;
  console.log("[wsHub] WebSocketServer registered");
}

// When a socket is authenticated as a given user
export function registerUserSocket(userId: number, socket: AuthedWebSocket) {
  let set = userSockets.get(userId);
  if (!set) {
    set = new Set();
    userSockets.set(userId, set);
  }
  set.add(socket);
}

// On socket close
export function unregisterSocket(socket: AuthedWebSocket) {
  for (const [userId, set] of userSockets.entries()) {
    if (set.has(socket)) {
      set.delete(socket);
      if (set.size === 0) {
        userSockets.delete(userId);
      }
      break;
    }
  }
}

// 🔑 This is the helper your route will use.
export function broadcastToUsers(userIds: number[], payload: any) {
  if (!wssGlobal) {
    console.warn("[wsHub] broadcastToUsers called before WSS registered");
    return;
  }

  const json = JSON.stringify(payload);
  console.log("CHECKK BROADCASTER", json, userIds)

  for (const userId of userIds) {
    const sockets = userSockets.get(userId);
    console.log("checkk SOCKETS", sockets === undefined ? undefined : "SocketObject")

    if (!sockets) continue;

    for (const socket of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        console.log("SENDING")
        socket.send(json);
      }
    }
  }
}
