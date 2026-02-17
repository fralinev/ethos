import { db } from "../db";
import type { Pool, PoolClient } from "pg";

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

