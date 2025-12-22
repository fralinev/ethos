require('dotenv').config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { UpstashStore } from "./upstashStore";
import { redis } from './redisClient';
import session from "express-session";
import { db } from './db';
import { usersRouter } from "./routes/users";
import { authRouter } from './routes/auth';
import { chatsRouter } from './routes/chats';
import { sessionMiddleware } from './session';
import { userSockets, chatSockets } from './ws/hub';



const allowedOrigins = [
  "http://localhost:3000",
  "https://ethos.fralinev.dev"
];

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(helmet());
app.use(sessionMiddleware);
app.use(express.json());

app.get("/socket-maps", (req, res) => {
  if (process.env.NODE_ENV === "development") {
    const userIds = [];
    const chatIds: Record<string, { id: string, username?: string }[]> = {};
    for (const [userId] of userSockets) {
      userIds.push(userId)
    }
    for (const [chatId, set] of chatSockets) {
      chatIds[chatId] = []
      for (const { user } of set) {
        if (user) {
          chatIds[chatId].push(user)

        }

      }
    }

    res.status(200).json({ userIds, chatIds })
  } else {
    res.sendStatus(404)
  }
})

app.get("/health", async (req, res) => {
  let dbStatus = "ok";
  let redisStatus = "ok";

  // try {
  //   await db.query("SELECT 1");
  // } catch (e) {
  //   console.error("DB health error:", e);
  //   dbStatus = "error";
  // }

  // try {
  //   await redis.ping();
  // } catch (e) {
  //   console.error("Redis health error:", e);
  //   redisStatus = "error";
  // }

  res.json({
    api: "ok",
    db: "assume ok",
    redis: "assume ok",
    ws: "ok",
  });
});

app.get('/', (_req, res) => {
  res.send('Ethos API is running');
});

app.use("/users", usersRouter);
app.use("/auth", authRouter)
app.use("/chats", chatsRouter)

export default app;