import { Router } from "express";
import { db } from "../db";
import { broadcastToUsers } from "../ws/hub";
import type { NewChat, ChatRow } from "@ethos/shared"




export const chatsRouter = Router();

chatsRouter.post("/create", async (req, res) => {
  try {
    const { body, headers }: { body: NewChat; headers: any } = req;
    const requesterIdRaw = headers?.["x-user-id"];
    const requesterId = requesterIdRaw;

    if (!requesterIdRaw) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (!body.subject) body.subject = null;

    // basic payload shape guard
    if (
      !body ||
      !Array.isArray(body.userIds)
    ) {
      return res.status(400).json({ message: "invalid payload" });
    }

    const requester = await db.query(
      "SELECT id, username FROM users WHERE id = $1",
      [requesterId]
    );
    if (!requester || !requester.rowCount) {
      return res.status(401).json({ message: "requestor not found" });
    }
    const requesterRow = requester.rows[0];

    const limitedParts =
      body.userIds.length > 7
        ? body.userIds.slice(0, 7)
        : body.userIds;

    const limitedNums = limitedParts.map((id) => {
      return Number(id)
    })

    if (body.subject !== null && body.subject.length > 21) {
      return res.status(400).json({ message: "bad request" });
    }

    const result = await db.query(
      "SELECT id, username FROM users WHERE id = ANY($1::bigint[])",
      [limitedNums]
    );

    const foundUsers = result.rows;
    const foundUsersSet = new Set(
      foundUsers.map((u) => u.id)
    );

    const missing = limitedParts.filter(
      (id) => !foundUsersSet.has(id)
    );

    if (missing.length > 0) {
      return res.status(400).json({
        message: "user not found",
        missing,
      });
    }

    const totalParts = [
      ...foundUsers.map((u) => ({ id: u.id, username: u.username })),
      { id: requesterRow.id, username: requesterRow.username },
    ];

    const uniqueById = new Map<string, { id: string; username: string }>();
    for (const u of totalParts) {
      uniqueById.set(u.id, u);
    }
    const finalMembers = Array.from(uniqueById.values());

    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const chatInsert = await client.query(
        `
        INSERT INTO chats (subject, created_by)
        VALUES ($1, $2)
        RETURNING id, subject, created_by, created_at
        `,
        [body.subject === null ? null : body.subject.trim(), requesterRow.id]
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
        subject: chat.subject,
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

      broadcastToUsers(finalMembers.map(u => u.id), "chat:created", chatDTO);

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
    const requesterId = requesterIdRaw;

    if (!requesterIdRaw) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const requester = await db.query(
      "SELECT id, username FROM users WHERE id = $1",
      [requesterId]
    );

    if (!requester || !requester.rowCount) {
      return res.status(401).json({ message: "requestor not found" });
    }

    const chatsResult = await db.query<ChatRow>(
      `
      SELECT c.id, c.subject, c.created_by, c.created_at
      FROM chats c
      INNER JOIN chat_members cm ON cm.chat_id = c.id
      WHERE cm.user_id = $1
        AND cm.left_at IS NULL
        AND c.archived_at IS NULL
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

    const membersResult = await db.query(
      `
      SELECT cm.chat_id, u.id, u.username
      FROM chat_members cm
      INNER JOIN users u ON u.id = cm.user_id
      WHERE cm.chat_id = ANY($1::int[])
      `,
      [chatIds]
    );

    const creatorsResult = await db.query(
      `
      SELECT id, username
      FROM users
      WHERE id = ANY($1::int[])
      `,
      [creatorIds]
    );

    const creatorMap = new Map<string, { id: string; username: string }>();
    for (const row of creatorsResult.rows as Array<{
      id: string;
      username: string;
    }>) {
      creatorMap.set(row.id, { id: row.id, username: row.username });
    }

    const membersByChatId = new Map<
      string,
      Array<{ id: string; username: string }>
    >();

    for (const row of membersResult.rows as Array<{
      chat_id: string;
      id: string;
      username: string;
    }>) {
      const existing = membersByChatId.get(row.chat_id) ?? [];
      existing.push({ id: row.id, username: row.username });
      membersByChatId.set(row.chat_id, existing);
    }

    const chatDtos = chats.map((chat) => {
      const creator = creatorMap.get(chat.created_by);
      const members = membersByChatId.get(chat.id) ?? [];

      return {
        id: chat.id,
        subject: chat.subject,
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
    const requesterIdRaw = headers?.["x-user-id"];
    const requesterId = requesterIdRaw;

    if (!requesterIdRaw) {
      return res.status(401).json({ message: "unauthorized" });
    }

    const chatIdRaw = params.chatId;
    const chatId = chatIdRaw;

    if (!chatIdRaw) {
      return res.status(400).json({ message: "invalid chat id" });
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
    const requesterId = requesterIdRaw;

    if (!requesterIdRaw) {
      return res.status(401).json({ message: "unauthorized" });
    }


    const chatIdRaw = params.chatId;
    const chatId = chatIdRaw;

    if (!chatIdRaw) {
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

    const messageDTO = {
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

    const memberIds = membersResult.rows.map((row) => row.user_id);

    broadcastToUsers(memberIds, "message:created", messageDTO);

    return res.status(201).json(messageDTO);
  } catch (err) {
    console.error("error creating message:", err);
    return res.status(500).json({ message: "unknown" });
  }
});


chatsRouter.post("/:chatId", async (req, res) => {
  try {

    const userId = req.header("x-user-id");
    const { chatId } = req.params;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!chatId) return res.status(400).json({ message: "Invalid chatId" });

    const requestor = await db.query(
      `
      SELECT 1
      FROM chat_members
      WHERE chat_id = $1
      AND user_id = $2
      AND left_at IS NULL
      `,
      [chatId, userId]
    )

    if (requestor.rows.length === 0) return res.status(401).json({ message: "User not member" })

    await db.query(
      `
      UPDATE chat_members
      SET left_at = now()
      WHERE chat_id = $1
      AND user_id = $2
      AND left_at IS NULL
      `,
      [chatId, userId]
    )

    const remainder = await db.query(
      `
      SELECT 1
      FROM chat_members
      WHERE chat_id = $1
      AND left_at IS NULL
      LIMIT 1
      `,
      [chatId]
    )

    if (remainder.rows.length === 0) {
      // archive chat
      await db.query(
        `
        UPDATE chats
        SET archived_at = now()
        WHERE chat_id = $1
        `,
        [chatId]
      )
    } else {
      const members = await db.query(
        `
        SELECT user_id
        FROM chat_members
        WHERE chat_id = $1
        AND left_at IS NULL
        `,
        [chatId]
      ) 
      const memberIds = members.rows.map(({user_id}) => user_id)
      broadcastToUsers([...memberIds, userId], "chat:left", { chatId, leftBy: userId });

    }


    return res.status(200).json({ message: "Update successful" })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err })

  }
})

chatsRouter.patch("/:chatId", async (req, res) => {
  try {

    const userIdHeader = req.header("x-user-id");
    const userId = userIdHeader;

    if (!userIdHeader) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { chatId: chatIdParam } = req.params;
    const chatId = chatIdParam;

    if (!chatIdParam) {
      return res.status(400).json({ message: "invalid chat id" });
    }

    const requester = await db.query(
      "SELECT id, username FROM users WHERE id = $1",
      [userId]
    );

    // const { subject: oldSubject, newSubject } = req.body

    const { body } = req;
    const oldSubject = body.subject;
    if (!body.newSubject) body.newSubject = null;
    const { newSubject } = body

    const result = await db.query(
      `
      UPDATE chats
      SET subject = $1
      WHERE id = $2
      RETURNING id, subject, created_by, created_at
      `,
      [newSubject, chatId]
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

    const memberIds = chatMembers.rows.map((row) => row.user_id);
    broadcastToUsers(memberIds, "chat:renamed", { chatId, changedBy: requester.rows[0].username, oldSubject, newSubject });

    return res.status(200).json({ result });
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: "unknown" });
  }

})