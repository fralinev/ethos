import { Router } from "express";
import { db } from "../db";
import type { Profile } from "@ethos/shared";

export const profilesRouter = Router();


profilesRouter.get("/:userId", async (req, res) => {
  try {
    const { params } = req;
    const response = await db.query(
      `
      SELECT
        u.username,
        u.avatar_url,
        p.full_name,
        p.bio
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
      `,
      [params.userId]
    )

    const profile: Profile = {
      avatarURL: "",
      fullName: "",
      bio: ""
    }
    profile.avatarURL = response.rows[0].avatar_url || ""
    profile.fullName = response.rows[0].full_name || ""
    profile.bio = response.rows[0].bio || ""
    res.json({ message: "success", profile })

  } catch (err) {
    console.error(err)
  }
})

profilesRouter.post("/", async (req, res) => {
  try {
    const { body } = req;
    const { userId, avatarURL, fullName, bio } = body;

    await db.query("BEGIN");

    const usersTableResponse = await db.query(
      `
      UPDATE users
      SET avatar_url = $2,
        updated_at = now()
      WHERE id = $1
      RETURNING avatar_url
      `,
      [userId, avatarURL]
    );



    const profilesTableResponse = await db.query(
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

      RETURNING full_name, bio, updated_at;
      `,
      [userId, fullName, bio]
    );

    await db.query("COMMIT");

    const savedProfile: Profile = {
      avatarURL: "",
      fullName: "",
      bio: ""
    }
    savedProfile.avatarURL = usersTableResponse.rows[0].avatar_url || ""
    savedProfile.fullName = profilesTableResponse.rows[0].full_name || ""
    savedProfile.bio = profilesTableResponse.rows[0].bio || ""
    res.json({ message: "success", savedProfile })
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err)
    res.json({ message: "massive sacatroophic error" })

  }
})