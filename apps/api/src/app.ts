// apps/api/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

require('dotenv').config();

import { db } from './db';
import { usersRouter } from "./routes/users";
import { authRouter } from './routes/auth';

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
  credentials: false
}));
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