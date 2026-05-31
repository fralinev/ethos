import { db } from "../db";
import type { Pool, PoolClient } from "pg";
import type { ChatType } from "@ethos/shared"
import { ChatRow, Member, MessageRow } from "../types/types";

type CreateChatInput = {
  requesterId: string;
  type: ChatType;
  subject: string | null;
  userAId: string | null;
  userBId: string | null;
};

export async function createChat(
  input: CreateChatInput,
  client: Pool | PoolClient = db
) {

  const { requesterId, type, subject = null, userAId = null, userBId = null } = input;
  const result = await client.query<ChatRow>(
    `
    INSERT INTO chats (subject, created_by, type, user_a_id, user_b_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [subject, requesterId, type, userAId, userBId]
  );
  return result.rows[0];
}

type AddMemberInput = {
  chatId: string;
  userId: string;
}

export async function addMember(
  input: AddMemberInput,
  client: Pool | PoolClient = db
) {
  const { chatId, userId } = input;
  await client.query(
    `
    INSERT INTO chat_members (chat_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    `,
    [chatId, userId]
  )
}

export async function getChatsByUserId(
  userId: string,
  client: Pool | PoolClient = db
) {
  const result = await client.query<ChatRow>(
    `
    SELECT c.id, c.subject, c.type, c.created_by, c.created_at
    FROM chats c
    INNER JOIN chat_members cm ON cm.chat_id = c.id
    WHERE cm.user_id = $1
      AND cm.left_at IS NULL
      AND c.archived_at IS NULL
    ORDER BY c.created_at DESC
    `,
    [userId]
  );
  return result.rows
}

export async function getChatByIdForUser(
  chatId: string,
  userId: string,
  client: Pool | PoolClient = db
) {
  const result = await client.query<ChatRow>(
    `
    SELECT c.id, c.subject, c.type, c.created_by, c.created_at
    FROM chats c
    INNER JOIN chat_members cm ON cm.chat_id = c.id
    WHERE c.id = $1
      AND cm.user_id = $2
      AND cm.left_at IS NULL
      AND c.archived_at IS NULL
    LIMIT 1
    `,
    [chatId, userId]
  );

  return result.rows[0];
}

export async function getMembersByChatIds(
  chatIds: string[],
  client: Pool | PoolClient = db
) {
  const result = await client.query<(Member & { chat_id: string })>(`
    SELECT cm.chat_id, u.id, u.username, u.role
    FROM chat_members cm
    JOIN users u ON u.id = cm.user_id
    WHERE cm.chat_id = ANY($1::int[])
      AND cm.left_at IS NULL
    `,
    [chatIds]
  )
  return result.rows
}

export async function getMessages(
  chatId: string,
  userId: string,
  client: Pool | PoolClient = db
) {
  const result = await client.query<MessageRow>(
    `
      SELECT
        m.id,
        m.chat_id,
        m.content,
        m.created_at,
        m.sender_id,
        u.username
      FROM messages m
      JOIN chat_members cm
        ON cm.chat_id = m.chat_id
      JOIN users u
        ON u.id = m.sender_id
      WHERE m.chat_id = $1
        AND cm.user_id = $2
        AND cm.left_at IS NULL
      ORDER BY m.created_at ASC;
    `,
    [chatId, userId]
  );
  return result.rows
}

export async function getMessage(id: string, client: Pool | PoolClient = db
) {
  const result = await client.query<MessageRow>(`
    SELECT
      m.id,
      m.chat_id,
      m.content,
      m.created_at,
      m.sender_id,
      u.id AS sender_id,
      u.username
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.id = $1;
  `, [id]
  )
  return result.rows[0]
}

export async function postMessage({ chatId, userId, content }: any,
  client: Pool | PoolClient = db

) {
  const result = await client.query<{ id: string }>(
    `
      INSERT INTO messages (chat_id, sender_id, content)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
    [chatId, userId, content]
  );
  return result.rows[0]
}

export async function getMemberIds(chatId: string, client: Pool | PoolClient = db): Promise<string[]> {
  const result = await client.query<{ user_id: string }>(`
      SELECT user_id
      FROM chat_members
      WHERE chat_id = $1
        AND left_at IS NULL
    `, [chatId])

  return result.rows.map(u => u.user_id)
}

export async function updateSubject({
  newSubject,
  chatId,
  userId
}: {
  newSubject: string;
  chatId: string;
  userId: string
}, client: Pool | PoolClient = db
) {
  const result = await client.query<ChatRow & { username: string }>(`
    UPDATE chats
    SET subject = $1
    FROM users u
    WHERE chats.id = $2
      AND u.id = $3
      AND EXISTS (
        SELECT 1
        FROM chat_members cm
        WHERE cm.chat_id = chats.id
          AND cm.user_id = $3
      )
    RETURNING
      chats.id,
      chats.subject,
      chats.created_by,
      chats.created_at,
      chats.archived_at,
      chats.type,
      u.username
      `,
    [newSubject, chatId, userId]
  )
  return result.rows[0]
}

export async function removeMember({ chatId, userId }: { chatId: string, userId: string }, client: Pool | PoolClient = db) {
  const result = await client.query(`
    UPDATE chat_members cm
    SET left_at = now()
    FROM chats c
    WHERE cm.chat_id = $1
      AND cm.user_id = $2
      AND cm.left_at IS NULL
      AND c.id = cm.chat_id
      AND c.type = 'group'
    RETURNING 1
    `,
    [chatId, userId]
  )
  return result
}

export async function archiveChat(chatId: string, client: Pool | PoolClient = db) {
  await client.query(`
    UPDATE chats
    SET archived_at = now()
    WHERE id = $1
    `,
    [chatId]
  );
}
