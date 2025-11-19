// apps/api/src/app.ts
require('dotenv').config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { UpstashStore } from "./redisStore";
import { redis } from './redisClient';

import session from "express-session";
import { db } from './db';
import { usersRouter } from "./routes/users";
import { authRouter } from './routes/auth';

// import { Redis } from '@upstash/redis'
// const redis = new Redis({
//   url: 'https://possible-trout-31818.upstash.io',
//   token: process.env.UPSTASH_REDIS_REST_TOKEN
// })
export const sessionMiddleware = session({
  name: "connect.sid",
  store: new UpstashStore(redis),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain:
      process.env.NODE_ENV === "production"
        ? ".ethos.fralinev.dev"
        : undefined, // no domain in dev => host-only cookie for localhost
         path: "/",
  },
});

const allowedOrigins = [
  "http://localhost:3000",
  "https://ethos.fralinev.dev"
];

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy
}

// Basic middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(helmet());
app.use(sessionMiddleware);


app.use(express.json());

// Health check (useful for verifying the server runs)
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

// Example placeholder route group
app.get('/', (_req, res) => {
  res.send('Ethos API is running');
});

app.use("/users", usersRouter);
app.use("/auth", authRouter)

export default app;