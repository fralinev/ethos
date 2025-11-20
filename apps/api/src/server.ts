import http from "http";
import app from "./app";
import { createWebSocketServer } from "./ws";
import { sessionStore } from "./session";

const server = http.createServer(app);

// Debug log: make sure this appears in Render logs on boot
console.log("[ws] initializing WebSocket server...");
createWebSocketServer(server, sessionStore);

// Optional: pure debug to see all upgrade attempts
server.on("upgrade", (req) => {
  console.log("[http] upgrade event", req.url);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});

