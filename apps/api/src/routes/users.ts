import { Router } from "express";
import { db } from "../db";

export const usersRouter = Router();

/**
 * GET /api/users
 * Optional query params:
 *   - limit (number, default 50, max 200)
 *   - offset (number, default 0)
 *   - q (string, search in name/email)
 */
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
          select id, name, email, created_at
          from users
          where name ilike $1 or email ilike $1
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
          select id, name, email, created_at
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

/**
 * POST /api/users
 * Body: { name: string, email: string }
 */
usersRouter.post("/", async (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }

  try {
    const result = await db.query(
      `insert into users(name, email)
       values ($1, $2)
       returning id, name, email, created_at`,
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (e: any) {
    if (e?.code === "23505") {
      // unique_violation (email)
      return res.status(409).json({ error: "email already exists" });
    }
    res.status(500).json({ error: e.message });
  }
});
