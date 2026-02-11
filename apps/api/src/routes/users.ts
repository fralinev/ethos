import { Router } from "express";
import { db } from "../db";

export const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
  const {headers} = req;
  const requesterId = headers?.["x-user-id"];

  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Math.max(Number(req.query.offset ?? 0), 0);
  const q = (req.query.q as string | undefined)?.trim();

  try {
    let rows;
    if (q && q.length > 0) {
      rows = (
        await db.query(
          `
          select id, username, created_at
          from users
          where username ilike $1
          order by id asc
          limit $2 offset $3
        `,
          [`%${q}%`, limit, offset]
        )
      ).rows;
    } else {
      rows = (
        await db.query(
          `
          SELECT DISTINCT u.*
          FROM users u
          JOIN chat_members cm ON cm.user_id = u.id
          JOIN chat_members my_cm ON my_cm.chat_id = cm.chat_id
          WHERE my_cm.user_id = $1
          AND u.id != $1;
          `,
          [requesterId]
        )
      ).rows;
    }

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});