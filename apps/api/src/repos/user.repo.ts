import { db } from "../db";
import type { Pool, PoolClient } from "pg";
import type { User } from "@/packages/shared/dist";

export async function getUserById(
  userId: string,
  client: Pool | PoolClient = db
) {

  const result = await client.query(
    "SELECT id, username, role, created_at FROM users WHERE id = $1",
    [userId]
  );
  return result?.rows?.[0]
}

export async function getUsersById(
  userIds: string[],
  client: Pool | PoolClient = db

) {
  const result = await client.query(
    `
    SELECT id, username, role, created_at 
    FROM users 
    WHERE id = ANY($1::bigint[])
    `,
    [userIds]
  );
  return result.rows
}

export async function getMyUsers({
  requesterId,
  limit,
  offset
}: {
  requesterId: string,
  limit: number,
  offset: number
},
  client: Pool | PoolClient = db
) {
  const users: User[] = (
    await client.query(
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
  return users;
}

export async function getUsersByQuery({
  q,
  requesterId,
  limit,
  offset }: {
    q: string,
    requesterId: string,
    limit: number,
    offset: number
  },
  client: Pool | PoolClient = db
) {
  const users: User[] = (
    await client.query(
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
  return users;
}

