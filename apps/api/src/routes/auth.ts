import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import { broadcastToUsers } from "../ws/hub";
import { AUTH_ERRORS } from "@ethos/shared"

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
      return res.status(401).json({ message: AUTH_ERRORS.WRONG_FIELD })
    }
    const user = result.rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ message: AUTH_ERRORS.MISSING_FIELD })
    }
    req.session.user = {
      id: user.id,
      username: user.username
    }
    const sessionId = req.sessionID;
    await db.query("UPDATE users SET last_login_at = now() WHERE username = $1", [normalizedUsername]);

    broadcastToUsers([user.id], "user:login", {username: user.username});

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
      return res.status(400).json({ message: AUTH_ERRORS.MISSING_FIELD });
    }
    const normalizedUsername = username.trim().toLowerCase();
    const result = await db.query("SELECT * FROM users WHERE username = $1", [normalizedUsername])
    if (result.rows.length > 0) {
      return res.status(409).json({ message: AUTH_ERRORS.USER_ALREADY_EXISTS });
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = await db.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
      [normalizedUsername, hash]
    );
    const { id, created_at } = newUser.rows[0]
    return res.status(201).json({ user: normalizedUsername, id, created_at })

  } catch (e: any) {
    if (e.code === "23505") {
      return res.status(409).json({ message:AUTH_ERRORS.USER_ALREADY_EXISTS });
    }
    return res.status(500).json({ message: "internal service error" })
  }
})

authRouter.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("logout error", err);
      return res.status(500).json({ ok: false, message: AUTH_ERRORS.LOGOUT_FAILED });
    }
    res.clearCookie("connect.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain:
        process.env.NODE_ENV === "production"
          ? ".ethos.fralinev.dev"
          : undefined,
      path: "/", 
    });
    return res.json({ ok: true, message: "logged out" });
  });
});