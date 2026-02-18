import type { Pool, PoolClient } from "pg";
import type { Profile } from "@ethos/shared";
import { db } from "../db";

type ProfileRow = {
  avatar_url: string | null;
  full_name: string | null;
  bio: string | null;
};

type UpsertProfileInput = {
  userId: string;
  avatarURL: string;
  fullName: string;
  bio: string;
};

export async function getProfileByUserId(
  userId: string,
  client: Pool | PoolClient = db
): Promise<Profile> {
  const result = await client.query<ProfileRow>(
    `
    SELECT
      u.avatar_url,
      p.full_name,
      p.bio
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.id = $1
    LIMIT 1
    `,
    [userId]
  );

  const row = result.rows[0];

  return {
    avatarURL: row?.avatar_url ?? "",
    fullName: row?.full_name ?? "",
    bio: row?.bio ?? "",
  };
}

export async function upsertProfile(
  input: UpsertProfileInput,
  client: Pool | PoolClient = db
): Promise<Profile> {
  const { userId, avatarURL, fullName, bio } = input;

  const usersTableResponse = await client.query<{ avatar_url: string | null }>(
    `
    UPDATE users
    SET avatar_url = $2,
      updated_at = now()
    WHERE id = $1
    RETURNING avatar_url
    `,
    [userId, avatarURL]
  );

  const profilesTableResponse = await client.query<{
    full_name: string | null;
    bio: string | null;
  }>(
    `
    INSERT INTO profiles (
      user_id,
      full_name,
      bio,
      updated_at
    )
    VALUES ($1, $2, $3, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
      full_name = EXCLUDED.full_name,
      bio = EXCLUDED.bio,
      updated_at = now()
    RETURNING full_name, bio;
    `,
    [userId, fullName, bio]
  );

  return {
    avatarURL: usersTableResponse.rows[0]?.avatar_url ?? "",
    fullName: profilesTableResponse.rows[0]?.full_name ?? "",
    bio: profilesTableResponse.rows[0]?.bio ?? "",
  };
}
