import http from "http";
import app from "./app";
import { sessionMiddleware } from "./session";
import { createWebSocketServer } from "./ws";
import { sessionStore } from "./session";

const server = http.createServer(app);

// Important: sessionMiddleware is still used by HTTP routes,
// but WS uses the sessionStore directly in handleAuthUpgrade.
app.use(sessionMiddleware);

createWebSocketServer(server, sessionStore);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});

