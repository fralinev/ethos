import type { Server } from "http";
import type { IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { sessionMiddleware } from "../app";

type AuthedRequest = IncomingMessage & { sessionID?: any };
type AuthedWebSocket = WebSocket & { user?: string };

export function initWebsocketServer(server: Server) {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws: AuthedWebSocket, req: AuthedRequest) => {
        console.log("WS raw cookies:", req.headers.cookie);
        // Run express-session on the upgrade request

        sessionMiddleware(req as any, {} as any, () => {
            const session = req.sessionID;
            console.log("WS session on connect:", {
                id: req.sessionID,
                hasSession: !!session,
                user: session?.user,
            });

            if (!session || !session.user) {
                console.log("WS unauthorized, closing");
                ws.close(1008, "Unauthorized");
                return;
            }

            // Attach identity to the socket
            ws.user = session.user;
            console.log("WS connected for user:", ws.user);

            ws.on("message", (msg) => {
                console.log(`WS message from ${ws.user}:`, msg.toString());
                ws.send(`pong from server, user=${ws.user}`);
            });

            ws.on("close", () => {
                console.log("WS: client disconnected", ws.user);
            });

            ws.on("error", (err) => {
                console.error("WS error:", err);
            });
        });
    });

    console.log("WebSocket server initialized with session support");
}