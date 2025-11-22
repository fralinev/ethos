import { Router } from "express";
import { db } from "../db";

type NewChat = {
  chatName: string,
  participants: string[]
}

export const chatsRouter = Router();

chatsRouter.post("/create", async (req, res) => {
  try {
    const { body, headers }: { body: NewChat, headers: any } = req;
    const requesterId = headers?.["x-user-id"]

    if (!requesterId) {
      return res.status(401).json({ message: "unauthorized" })
    }

    if (
      !body ||
      !Array.isArray(body.participants) ||
      typeof body.chatName !== "string"
    ) {
      return res.status(400).json({ message: "invalid payload" });
    }

    // get requestor from db

    const requester = await db.query("SELECT * FROM users WHERE id = $1", [requesterId])
    if (!requester || !requester.rowCount) {
      return res.status(401).json({ message: "requestor not found" })
    }

    // max count
    const limitedParts =
      body.participants.length > 4
        ? body.participants.slice(0, 4)
        : body.participants;

    // validate name length
    if (body.chatName.length > 15 || body.chatName.trim().length === 0) {
      return res.status(400).json({ message: "bad request" })
    }

    // normalize
    const normalizedParts = limitedParts
      .map(name => name.trim().toLowerCase())
      .filter(name => name.length > 0); // drop empty

    // dedupe
    const requestedSet = new Set(normalizedParts)

    // delete requester if present
    requestedSet.delete(requester.rows[0].username.toLowerCase());
    const requestedArray = Array.from(requestedSet)

    // db lookup
    const result = await db.query(
      "SELECT id, username FROM users WHERE username = ANY($1::text[])",
      [requestedArray]
    );

    const foundUsers = result.rows;
    const foundUsernameSet = new Set(foundUsers.map(u => u.username.toLowerCase()));
    const missing = requestedArray.filter(
      name => !foundUsernameSet.has(name)
    );

    if (missing.length > 0) {
      return res.status(400).json({
        message: "user not found",
        missing, // helpful for debugging
      });
    }

    const totalParts = [
      ...foundUsers.map(u => ({ id: u.id, username: u.username })),
      { id: requester.rows[0].id, username: requester.rows[0].username },
    ];

    console.log("total parts", totalParts)









  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "unknown" })
  }
})
