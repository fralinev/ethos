import { Router } from "express";
import { db } from "../db";
import type { UserRow } from "../types/types";

export const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
  const requesterId = req.session.userId;
  if (!requesterId) {
    return res.status(401).json({ message: "unauthorized" });
  }

  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);
  const q = (req.query.q as string | undefined)?.trim();

  try {
    let rows;
    if (q && q.length > 0) {
      rows = (
        await db.query(
          `
          SELECT id, username, created_at
          FROM users
          WHERE username ilike $1
            AND id <> $2
          ORDER by id asc
          LIMIT $3 offset $4
        `,
          [`%${q}%`, requesterId, limit, offset]
        )
      ).rows;
    } else {
      rows = (
        await db.query(
          `
          SELECT DISTINCT u.id, u.username, u.created_at
          FROM users u
          JOIN chat_members cm ON cm.user_id = u.id
          JOIN chat_members my_cm ON my_cm.chat_id = cm.chat_id
          WHERE my_cm.user_id = $1
            AND u.id <> $1
          ORDER BY u.id ASC
          LIMIT $2 OFFSET $3
          `,
          [requesterId, limit, offset]
        )
      ).rows;
    }

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});


usersRouter.get("/:userId", async (req, res) => {
  const requesterId = req.session.userId;
  if (!requesterId) {
    return res.status(401).json({ message: "unauthorized" });
  }
  const { userId } = req.params;
  try {
    const result = await db.query(
        `SELECT id, username, role, created_at FROM users WHERE id = $1`,
        [userId]
      )
    const user: UserRow = result.rows[0]
    if (!user) return res.status(404).json({ message: "not found" });
    return res.json({ id: user.id, username: user.username, role: user.role, createdAt: user.created_at });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
});