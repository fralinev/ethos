import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Keep pool small for serverless/containers; tweak as needed
export const db = new Pool({
  connectionString,
  max: 10,
  // Neon requires SSL; sslmode=require in the URL is usually enough.
  // If you ever need it explicitly:
  // ssl: { rejectUnauthorized: false },
});

// Optional: a quick readiness check helper
export async function checkDb() {
  const { rows } = await db.query("select 1 as ok");
  return rows[0].ok === 1;
}
