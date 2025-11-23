import { Router } from "express";
import { db } from "../db";

type NewChat = {
  chatName: string;
  participants: string[];
};

type ChatRow = {
  id: number;
  name: string;
  created_by: number;
  created_at: string;
};

export const chatsRouter = Router();

chatsRouter.post("/create", async (req, res) => {
  try {
    const { body, headers }: { body: NewChat; headers: any } = req;
    const requesterIdRaw = headers?.["x-user-id"];
    const requesterId = Number(requesterIdRaw);

    if (!requesterIdRaw || Number.isNaN(requesterId)) {
      return res.status(401).json({ message: "unauthorized" });
    }

    // basic payload shape guard
    if (
      !body ||
      !Array.isArray(body.participants) ||
      typeof body.chatName !== "string"
    ) {
      return res.status(400).json({ message: "invalid payload" });
    }

    // get requestor from db
    const requester = await db.query(
      "SELECT id, username FROM users WHERE id = $1",
      [requesterId]
    );
    if (!requester || !requester.rowCount) {
      return res.status(401).json({ message: "requestor not found" });
    }
    const requesterRow = requester.rows[0];

    // max count
    const limitedParts =
      body.participants.length > 4
        ? body.participants.slice(0, 4)
        : body.participants;

    // validate name length
    if (body.chatName.length > 15 || body.chatName.trim().length === 0) {
      return res.status(400).json({ message: "bad request" });
    }

    // normalize participants
    const normalizedParts = limitedParts
      .map((name) => name.trim().toLowerCase())
      .filter((name) => name.length > 0); // drop empty

    // dedupe
    const requestedSet = new Set(normalizedParts);

    // delete requester if present
    requestedSet.delete(requesterRow.username.toLowerCase());
    const requestedArray = Array.from(requestedSet);

    // OPTIONAL: require at least one other participant
    // if (requestedArray.length === 0) {
    //   return res
    //     .status(400)
    //     .json({ message: "at least one participant required" });
    // }

    // db lookup for participants in one query
    const result = await db.query(
      "SELECT id, username FROM users WHERE username = ANY($1::text[])",
      [requestedArray]
    );

    const foundUsers = result.rows; // { id, username }[]
    const foundUsernameSet = new Set(
      foundUsers.map((u) => u.username.toLowerCase())
    );

    const missing = requestedArray.filter(
      (name) => !foundUsernameSet.has(name)
    );

    if (missing.length > 0) {
      return res.status(400).json({
        message: "user not found",
        missing,
      });
    }

    // combine requestor + participants
    const totalParts = [
      ...foundUsers.map((u) => ({ id: u.id, username: u.username })),
      { id: requesterRow.id, username: requesterRow.username },
    ];

    // dedupe by id (belt & suspenders)
    const uniqueById = new Map<number, { id: number; username: string }>();
    for (const u of totalParts) {
      uniqueById.set(u.id, u);
    }
    const finalMembers = Array.from(uniqueById.values());
    console.log("checkk finalMembers", finalMembers)

    // ─────────────────────────────
    // DB TRANSACTION: create chat + members
    // ─────────────────────────────
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      // insert chat
      const chatInsert = await client.query(
        `
        INSERT INTO chats (name, created_by)
        VALUES ($1, $2)
        RETURNING id, name, created_by, created_at
        `,
        [body.chatName.trim(), requesterRow.id]
      );

      const chat = chatInsert.rows[0];

      // insert members
      for (const member of finalMembers) {
        await client.query(
          `
          INSERT INTO chat_members (chat_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
          `,
          [chat.id, member.id]
        );
      }

      await client.query("COMMIT");

      // build chat DTO to return
      const chatDto = {
        id: chat.id,
        name: chat.name,
        createdAt: chat.created_at,
        createdBy: {
          id: requesterRow.id,
          username: requesterRow.username,
        },
        members: finalMembers.map((m) => ({
          id: m.id,
          username: m.username,
        })),
      };

      return res.status(201).json(chatDto);
    } catch (txErr) {
      await client.query("ROLLBACK");
      console.error("chat create transaction error:", txErr);
      return res.status(500).json({ message: "unknown" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "unknown" });
  }
});


chatsRouter.get("/", async (req, res) => {
  try {
    const { headers }: { headers: any } = req;
    const requesterIdRaw = headers?.["x-user-id"];
    const requesterId = Number(requesterIdRaw);

    if (!requesterIdRaw || Number.isNaN(requesterId)) {
      return res.status(401).json({ message: "unauthorized" });
    }

    // Ensure requester exists
    const requester = await db.query(
      "SELECT id, username FROM users WHERE id = $1",
      [requesterId]
    );

    if (!requester || !requester.rowCount) {
      return res.status(401).json({ message: "requestor not found" });
    }

    // Get all chats where requester is a member
    const chatsResult = await db.query<ChatRow>(
      `
      SELECT c.id, c.name, c.created_by, c.created_at
      FROM chats c
      INNER JOIN chat_members cm ON cm.chat_id = c.id
      WHERE cm.user_id = $1
      ORDER BY c.created_at DESC
      `,
      [requesterId]
    );

    if (!chatsResult.rowCount) {
      return res.status(200).json([]);
    }

    const chats = chatsResult.rows;
    const chatIds = chats.map((c) => c.id);
    const creatorIds = Array.from(
      new Set(chats.map((c) => c.created_by))
    );

    // Fetch all members for these chats
    const membersResult = await db.query(
      `
      SELECT cm.chat_id, u.id, u.username
      FROM chat_members cm
      INNER JOIN users u ON u.id = cm.user_id
      WHERE cm.chat_id = ANY($1::int[])
      `,
      [chatIds]
    );

    // Fetch creator usernames
    const creatorsResult = await db.query(
      `
      SELECT id, username
      FROM users
      WHERE id = ANY($1::int[])
      `,
      [creatorIds]
    );

    const creatorMap = new Map<number, { id: number; username: string }>();
    for (const row of creatorsResult.rows as Array<{
      id: number;
      username: string;
    }>) {
      creatorMap.set(row.id, { id: row.id, username: row.username });
    }

    // Build map of chatId -> members[]
    const membersByChatId = new Map<
      number,
      Array<{ id: number; username: string }>
    >();

    for (const row of membersResult.rows as Array<{
      chat_id: number;
      id: number;
      username: string;
    }>) {
      const existing = membersByChatId.get(row.chat_id) ?? [];
      existing.push({ id: row.id, username: row.username });
      membersByChatId.set(row.chat_id, existing);
    }

    // Build DTOs matching the POST /create response shape
    const chatDtos = chats.map((chat) => {
      const creator = creatorMap.get(chat.created_by);
      const members = membersByChatId.get(chat.id) ?? [];

      return {
        id: chat.id,
        name: chat.name,
        createdAt: chat.created_at,
        createdBy: creator
          ? {
              id: creator.id,
              username: creator.username,
            }
          : null,
        members: members.map((m) => ({
          id: m.id,
          username: m.username,
        })),
      };
    });

    return res.status(200).json(chatDtos);
  } catch (err) {
    console.error("error fetching chats:", err);
    return res.status(500).json({ message: "unknown" });
  }
});
