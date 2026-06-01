import { Router } from "express";
import * as userService from "../services/user.service"

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
      rows = await userService.getUsersByQuery({ q, requesterId, limit, offset })
    } else {
      rows = await userService.getMyUsers({ requesterId, limit, offset })
    }
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});


usersRouter.get("/me", async (req, res) => {
  const requesterId = req.session.userId;
  if (!requesterId) {
    return res.status(401).json({ message: "unauthorized" });
  }
  // const { userId } = req.params;
  try {
   
    const user = await userService.getUserById(requesterId)
    if (!user) return res.status(404).json({ message: "not found" });
    return res.json({ id: user.id, username: user.username, role: user.role, createdAt: user.created_at });
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message });
  }
});