import { Router } from "express";
import { db } from "../db";
import { broadcastToUsers } from "../ws/hub";

export type User = {
  id: string;
  username: string;
  created_at: string;
};

type NewChat = {
  chatName: string;
  selectedUsers: User[];
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
      !Array.isArray(body.selectedUsers) ||
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
      body.selectedUsers.length > 4
        ? body.selectedUsers.slice(0, 4)
        : body.selectedUsers;

    // validate name length
    if (body.chatName.length > 15 || body.chatName.trim().length === 0) {
      return res.status(400).json({ message: "bad request" });
    }

    // normalize participants
    const normalizedParts = limitedParts
      .map(({username}) => username.trim().toLowerCase())
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

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const chatInsert = await client.query(
        `
        INSERT INTO chats (name, created_by)
        VALUES ($1, $2)
        RETURNING id, name, created_by, created_at
        `,
        [body.chatName.trim(), requesterRow.id]
      );

      const chat = chatInsert.rows[0];

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

      const chatDTO = {
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

      broadcastToUsers(finalMembers.map(u => Number(u.id)), {
        type: "chat:created",
        payload: chatDTO,
      });

      return res.status(201).json(chatDTO);
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

chatsRouter.get("/:chatId/messages", async (req, res) => {
  try {
    const { headers, params } = req;

    // ─────────────────────────────
    // 1) Auth: validate requester
    // ─────────────────────────────
    const requesterIdRaw = headers?.["x-user-id"];
    const requesterId = Number(requesterIdRaw);

    if (!requesterIdRaw || Number.isNaN(requesterId)) {
      return res.status(401).json({ message: "unauthorized" });
    }

    // ─────────────────────────────
    // 2) Parse and validate chatId
    // ─────────────────────────────
    const chatIdRaw = params.chatId;
    const chatId = Number(chatIdRaw);

    if (!chatIdRaw || Number.isNaN(chatId)) {
      return res.status(400).json({ message: "invalid chat id" });
    }

    // ─────────────────────────────
    // 3) Ensure requester is a member of this chat
    // ─────────────────────────────
    const membership = await db.query(
      `
      SELECT 1
      FROM chat_members
      WHERE chat_id = $1 AND user_id = $2
      LIMIT 1
      `,
      [chatId, requesterId]
    );

    if (!membership.rowCount) {
      // Either chat doesn't exist or user isn't in it
      return res.status(403).json({ message: "forbidden" });
    }

    // ─────────────────────────────
    // 4) Fetch messages for this chat
    // ─────────────────────────────
    const messagesResult = await db.query(
      `
      SELECT
        m.id,
        m.chat_id,
        m.content,
        m.created_at,
        u.id AS sender_id,
        u.username AS sender_username
      FROM messages m
      INNER JOIN users u ON u.id = m.sender_id
      WHERE m.chat_id = $1
      ORDER BY m.created_at ASC
      `,
      [chatId]
    );

    const messages = messagesResult.rows.map((row) => ({
      id: row.id,
      chatId: row.chat_id,
      body: row.content,
      createdAt: row.created_at,
      sender: {
        id: row.sender_id,
        username: row.sender_username,
      },
    }));

    return res.status(200).json(messages);
  } catch (err) {
    console.error("error fetching chat messages:", err);
    return res.status(500).json({ message: "unknown" });
  }
});

chatsRouter.post("/:chatId/messages", async (req, res) => {
  try {
    const { headers, params, body } = req;

    const requesterIdRaw = headers?.["x-user-id"];
    const requesterId = Number(requesterIdRaw);

    if (!requesterIdRaw || Number.isNaN(requesterId)) {
      return res.status(401).json({ message: "unauthorized" });
    }


    const chatIdRaw = params.chatId;
    const chatId = Number(chatIdRaw);

    if (!chatIdRaw || Number.isNaN(chatId)) {
      return res.status(400).json({ message: "invalid chat id" });
    }

    const content = body?.content;

    if (typeof content !== "string") {
      return res.status(400).json({ message: "invalid payload" });
    }

    const trimmed = content.trim();

    if (trimmed.length === 0) {
      return res.status(400).json({ message: "message cannot be empty" });
    }

    if (trimmed.length > 4000) {
      return res.status(400).json({ message: "message too long" });
    }

    const membership = await db.query(
      `
      SELECT 1
      FROM chat_members
      WHERE chat_id = $1 AND user_id = $2
      LIMIT 1
      `,
      [chatId, requesterId]
    );

    if (!membership.rowCount) {
      return res.status(403).json({ message: "forbidden" });
    }

    const senderResult = await db.query(
      `
      SELECT id, username
      FROM users
      WHERE id = $1
      `,
      [requesterId]
    );

    if (!senderResult.rowCount) {
      return res.status(401).json({ message: "sender not found" });
    }

    const senderRow = senderResult.rows[0];

    const insertResult = await db.query(
      `
      INSERT INTO messages (chat_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, chat_id, sender_id, content, created_at
      `,
      [chatId, requesterId, trimmed]
    );

    const msg = insertResult.rows[0];

    const messageDto = {
      id: msg.id,
      chatId: msg.chat_id,
      body: msg.content,
      createdAt: msg.created_at,
      sender: {
        id: senderRow.id,
        username: senderRow.username,
      },
    };

    const membersResult = await db.query(
      `
      SELECT user_id
      FROM chat_members
      WHERE chat_id = $1
      `,
      [chatId]
    );

    const memberIds = membersResult.rows.map((row) => Number(row.user_id));


    console.log("CHECKK API for message", memberIds)
    broadcastToUsers(memberIds, {
      type: "message:created",
      payload: messageDto,
    });

    return res.status(201).json(messageDto);
  } catch (err) {
    console.error("error creating message:", err);
    return res.status(500).json({ message: "unknown" });
  }
});


chatsRouter.delete("/:chatId", async (req, res) => {
  try {
    const userIdHeader = req.header("x-user-id");
    const userId = Number(userIdHeader);

    if (!userIdHeader || Number.isNaN(userId)) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const { chatId: chatIdParam } = req.params;
    const chatId = Number(chatIdParam);

    if (!chatIdParam || Number.isNaN(chatId)) {
      return res.status(400).json({ message: "invalid chat id" });
    }

    const chatMembers = await db.query(
      `
      SELECT user_id
      FROM chat_members
      WHERE chat_id = $1
      `,
      [chatId]
    );

    const membershipResult = await db.query(
      `
      SELECT u.id, u.username
      FROM chat_members cm
      JOIN users u ON u.id = cm.user_id
      WHERE cm.chat_id = $1 AND cm.user_id = $2
      LIMIT 1
      `,
      [chatId, userId]
    );

    if (membershipResult.rowCount === 0) {
      return res.status(403).json({ message: "forbidden" });
    }


    const deleteResult = await db.query(
      `
      DELETE FROM chats
      WHERE id = $1
      RETURNING id, name
      `,
      [chatId]
    );

    const { name } = deleteResult.rows[0]
    const deletedBy = membershipResult.rows[0].username



    const memberIds = chatMembers.rows.map((row) => Number(row.user_id));
    broadcastToUsers(memberIds, {
      type: "chat:deleted",
      payload: { chatId, name, deletedBy },
    });

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "chat not found" });
    }

    return res.status(200).json({ message: "chat deleted" });
  } catch (err) {
    console.error("DELETE /chats/:chatId error:", err);
    return res.status(500).json({ message: "unknown" });
  }
});

chatsRouter.patch("/:chatId", async (req, res) => {
  try {

    const userIdHeader = req.header("x-user-id");
    const userId = Number(userIdHeader);

    if (!userIdHeader || Number.isNaN(userId)) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const { chatId: chatIdParam } = req.params;
    const chatId = Number(chatIdParam);

    if (!chatIdParam || Number.isNaN(chatId)) {
      return res.status(400).json({ message: "invalid chat id" });
    }

    const requester = await db.query(
      "SELECT id, username FROM users WHERE id = $1",
      [userId]
    );

    const { name: oldName, newName } = req.body

    const result = await db.query(
      `
      UPDATE chats
      SET name = $1
      WHERE id = $2
      RETURNING id, name, created_by, created_at
      `,
      [newName, chatId]
    );

    // const name = result.rows[0].name

    const chatMembers = await db.query(
      `
      SELECT user_id
      FROM chat_members
      WHERE chat_id = $1
      `,
      [chatId]
    );

    const memberIds = chatMembers.rows.map((row) => Number(row.user_id));
    broadcastToUsers(memberIds, {
      type: "chat:renamed",
      payload: { chatId, renamedBy: requester.rows[0].username, oldName, newName },
    });

    return res.status(200).json({ result });
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "unknown" });
  }

})