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

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // trust first proxy
}

// Basic middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(helmet());

app.use(express.json());

let sessionSecret = process.env.SESSION_SECRET;
app.use(
  session({
    secret: sessionSecret || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production" || false,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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