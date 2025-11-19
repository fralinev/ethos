import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "please provide username and password" });
    }
    const normalizedUsername = username.trim().toLowerCase();
    const result = await db.query("SELECT * FROM users WHERE username = $1", [normalizedUsername])
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "invalid username or password" })
    }
    const user = result.rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ message: "invalid username or password" })
    }
    req.session.user = {
      id: user.id,
      username: user.username
    }

    console.log("LOGIN session:", {
  id: req.sessionID,
  user: req.session.user,
});

    const sessionId = req.sessionID;

    await db.query("UPDATE users SET last_login_at = now() WHERE username = $1", [normalizedUsername]);


    return res.status(200).json({
      ok: true,
      message: "logged in",
      user: { id: user.id, username: user.username },
      sessionId
    });
  } catch (e) {
    console.error("login error", e);
    return res.status(500).json({ message: "internal service error" })
  }
})

authRouter.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "please provide username and password" });
    }
    const normalizedUsername = username.trim().toLowerCase();
    const c = await db.query("SELECT * FROM users WHERE username = $1", [normalizedUsername])
    if (c.rows.length > 0) {
      return res.status(409).json({ message: "username already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
      [normalizedUsername, hash]
    );
    const { id, created_at } = result.rows[0]
    return res.status(201).json({ user: normalizedUsername, id, created_at })

  } catch (e: any) {
    if (e.code === "23505") {
      return res.status(409).json({ message: "username already exists" });
    }
    return res.status(500).json({ message: "internal service error" })
  }
})

authRouter.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ user: null });
  }
  console.log(req.session)

  return res.json({ user: req.session.user });
});

authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("logout error", err);
      return res.status(500).json({ ok: false, message: "logout failed" });
    }

    // Clear the cookie with SAME options as sessionMiddleware.cookie
    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? ".ethos.fralinev.dev"
          : undefined,
      path: "/", // default but explicit
    });

    return res.json({ ok: true, message: "logged out" });
  });
});


authRouter.get("/session", (req, res) => {
  console.log(req.session)
  return res.json({ user: req.session });
})