// apps/api/src/server.ts
import http from "http";
import app, { sessionMiddleware } from "./app";
import { initWebsocketServer, AuthedRequest } from "./ws";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const server = http.createServer(app);
const wss = initWebsocketServer();

// This is the critical piece: handle WebSocket upgrades yourself
server.on("upgrade", (req: AuthedRequest, socket, head) => {
  // 1) Run session middleware on the raw upgrade request.
  sessionMiddleware(req as any, {} as any, () => {
    // 2) Check if the user is logged in
    if (!req.session || !req.session.user) {
      console.log("WS upgrade without valid session, rejecting");
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    console.log("WS upgrade authorized for user:", req.session.user);

    // 3) Let ws library finish the upgrade
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
});

server.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
