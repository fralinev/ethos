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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.get('/dbcheck', async (_req, res) => {
  try {
    const { rows } = await db.query("select 1 as ok");
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
})

app.get('/', (_req, res) => {
  res.send('Ethos API is running');
});

app.use("/users", usersRouter);
app.use("/auth", authRouter)

export default app;