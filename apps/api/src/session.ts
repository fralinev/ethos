
import session, { Store as SessionStore } from "express-session";
import { UpstashStore } from "./upstashStore";
import { redis } from "./redisClient"; 

export const sessionStore: SessionStore = new UpstashStore(redis);

export const sessionMiddleware = session({
  name: "connect.sid",
  store: sessionStore,
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain:
      process.env.NODE_ENV === "production"
        ? ".ethos.fralinev.dev"
        : undefined,
    path: "/",
  },
});
