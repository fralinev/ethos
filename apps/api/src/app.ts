// apps/api/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

require('dotenv').config();
import session from "express-session";
import { db } from './db';
import { usersRouter } from "./routes/users";
import { authRouter } from './routes/auth';

const allowedOrigins = [
  "http://localhost:3000",
  "https://ethos-web-jdtk.onrender.com",
];

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only with HTTPS
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

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