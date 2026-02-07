import type { WebSocketServer } from "ws";
import WebSocket from "ws";
import type { AuthedWebSocket } from ".";
import type { SocketEvents } from "@ethos/shared"

let wssGlobal: WebSocketServer | null = null;

export const userSockets = new Map<string, Set<AuthedWebSocket>>();
export const chatSockets = new Map<string, Set<AuthedWebSocket>>();

function logUserSocketKeys() {
  for (const [userId] of userSockets) {
    console.log("LOG current userSockets: ", userId);
  }
}
function logChatSocketKeys() {
  for (const [chatId] of chatSockets) {
    console.log("LOG current chatSockets: ", chatId);
  }
}



// Not used; possibly removable
export function registerWss(instance: WebSocketServer) {
  wssGlobal = instance;
  console.log("[wsHub] WebSocketServer registered");
}

export function registerUserSocket(userId: string, socket: AuthedWebSocket) {
  let set = userSockets.get(userId);
  if (!set) {
    set = new Set();
    userSockets.set(userId, set);
  }
  // Allow multiple sockets for same user
  set.add(socket);

}

export function unregisterUserSocket(socket: AuthedWebSocket) {

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

export function registerChatSocket(chatId: string, socket: AuthedWebSocket) {
  let set = chatSockets.get(chatId);
  if (!set) {
    set = new Set();
    chatSockets.set(chatId, set);
  }
  set.add(socket)
  for (const [chatId] of chatSockets) {
    console.log("LOG current chatSockets REG: ", chatId);
  }

}

export function unregisterChatSocket(socket: AuthedWebSocket) {
  console.log("removing chatId (UNREG)", socket.chatId)
  for (const [chatId, set] of chatSockets.entries()) {
    if (set.has(socket)) {
      set.delete(socket);
      if (set.size === 0) {
        chatSockets.delete(chatId);
      }
      break;
    }
  }

}


export function broadcastToUsers<E extends keyof SocketEvents>(userIds: string[], event: E, payload: SocketEvents[E]) {
  if (!wssGlobal) {
    console.warn("[wsHub] broadcastToUsers called before WSS registered");
    return;
  }

  const json = JSON.stringify({ type: event, payload });

  for (const userId of userIds) {
    const sockets = userSockets.get(userId);
    // console.log("checkk SOCKETS", sockets === undefined ? undefined : "SocketObject")

    if (!sockets) continue;

    for (const socket of sockets) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(json);
      }
    }
  }
}
