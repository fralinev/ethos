import { Router } from "express";
import { db } from "../db";

export const usersRouter = Router();

usersRouter.get("/", async (req, res) => {
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
          where username ilike $1 or email ilike $1
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
          select id, username, created_at
          from users
          order by id asc
          limit $1 offset $2
        `,
          [limit, offset]
        )
      ).rows;
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});