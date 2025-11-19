import http from "http";
import app from "./app";
import { initWebsocketServer } from "./ws"; // you'll create this

const port = Number(process.env.PORT) ?? 10000;

// Create raw HTTP server so WebSockets can hook in
const server = http.createServer(app);

// Initialize WebSocket server using the same HTTP server
initWebsocketServer(server);

// Start HTTP + WS server
server.listen(port, "0.0.0.0", () => {
  console.log(`Ethos API listening on http://0.0.0.0:${port}`);
});