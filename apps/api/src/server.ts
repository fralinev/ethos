import http from "http";
import app from "./app";
import { sessionMiddleware } from "./session";
import { createWebSocketServer } from "./ws";
import { sessionStore } from "./session";

const server = http.createServer(app);

createWebSocketServer(server, sessionStore);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});

