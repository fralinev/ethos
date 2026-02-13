import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import { broadcastToUsers } from "../ws/hub";
import { AUTH_ERRORS } from "@ethos/shared"
import type { dbUserRow } from "../types/types";



export const authRouter = Router();

const USERNAME_REGEX = /^[A-Za-z]{3,15}$/;
const PASSWORD_REGEX = /^.{8,64}$/;

authRouter.post("/login", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ error: AUTH_ERRORS.MISSING_FIELD });
    }

    const { username, password } = req.body;

    if (!username || typeof username !== "string" || !password || typeof password !== "string") {
      return res.status(400).json({ error: AUTH_ERRORS.MISSING_FIELD });
    }

    if (!USERNAME_REGEX.test(username)) {
      return res.status(400).json({ error: AUTH_ERRORS.INVALID_USERNAME })
    }

    // keep this off for quicker sign ins during development

    // if (!PASSWORD_REGEX.test(password)) {
    //   return res.status(400).json({ message: AUTH_ERRORS.INVALID_PASSWORD })
    // }

    const result = await db.query(
      `
      SELECT * 
      FROM users 
      WHERE username = $1
      `, [username]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: AUTH_ERRORS.WRONG_FIELD })
    }
    const user: dbUserRow = result.rows[0]
    const match = await bcrypt.compare(password, user.password_hash)
    if (!match) {
      return res.status(401).json({ error: AUTH_ERRORS.WRONG_FIELD })
    }
    req.session.userId = user.id

    await db.query(`
      UPDATE users 
      SET last_login_at = now() 
      WHERE username = $1
      `, [username]);

    broadcastToUsers([user.id], "user:login", { username: user.username });

    return res.status(200).json({
      ok: true,
      message: "logged in",
      user: { id: user.id, username: user.username, role: user.role, createdAt: user.created_at },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal service error" })
  }
})

authRouter.post("/signup", async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({ message: AUTH_ERRORS.MISSING_FIELD });
    }
    const { username, password } = req.body;

    if (!username || typeof username !== "string" || !password || typeof password !== "string") {
      return res.status(400).json({ message: AUTH_ERRORS.MISSING_FIELD });
    }

    if (!USERNAME_REGEX.test(username)) {
      return res.status(400).json({ message: AUTH_ERRORS.INVALID_USERNAME })
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ message: AUTH_ERRORS.INVALID_PASSWORD })
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `
      INSERT INTO users (username, password_hash) 
      VALUES ($1, $2) 
      RETURNING id, username, role, created_at
      `,
      [username, hash]
    );
    const newUser = result.rows[0]

    return res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    })

  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "code" in err && err.code === "23505") {
      return res.status(409).json({ message: AUTH_ERRORS.USER_ALREADY_EXISTS });
    }
    console.error(err)
    return res.status(500).json({ message: "unknown" })
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