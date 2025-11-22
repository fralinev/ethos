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

app.get("/health", async (req, res) => {
  let dbStatus = "ok";
  let redisStatus = "ok";

  try {
    await db.query("SELECT 1"); // real DB check
  } catch (e) {
    console.error("DB health error:", e);
    dbStatus = "error";
  }

  try {
    await redis.ping();
  } catch (e) {
    console.error("Redis health error:", e);
    redisStatus = "error";
  }

  res.json({
    api: "ok",
    db: dbStatus,
    redis: redisStatus,
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