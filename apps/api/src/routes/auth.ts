import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.sendStatus(400);
    }
    const normalizedUsername = username.trim().toLowerCase();
    const c = await db.query("SELECT * FROM users WHERE username = $1", [normalizedUsername])
    if (c.rows.length === 0) {
      return res.sendStatus(401)
    }
    const match = await bcrypt.compare(password, c.rows[0].password_hash)
    if (!match) {
      return res.sendStatus(401)
    }
    if (match) {
      // db.query("UPDATE users SET last_login_at = now() WHERE username = $1", [normalizedUsername])
      return res.status(200).json({ ok: true });
    }
  } catch (e) { 
    return res.sendStatus(500)
  }
})

authRouter.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.sendStatus(400);
    }
    const normalizedUsername = username.trim().toLowerCase();
    const c = await db.query("SELECT * FROM users WHERE username = $1", [normalizedUsername])
    if (c.rows.length > 0) {
      return res.sendStatus(409);
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
      return res.sendStatus(409);
    }
    return res.sendStatus(500)
  }
})