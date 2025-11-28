"use server";

import { cookies } from "next/headers";
// import { getSessionById, unsignExpressCookie } from "@/packages/shared/session";
// import { SessionData } from "@/packages/shared/session";

// packages/shared/session.ts
import { redis } from "@/packages/shared/redisClient";
import signature from "cookie-signature";

// This must match what your UpstashStore uses
const SESSION_PREFIX = "sess:";

export type SessionUser = {
  id: string;
  username: string;
  // add more fields if you store them
};

export type SessionData = {
  cookie: any;     // you can type this more strictly if you want
  user?: SessionUser;
};

// Turn a plain session ID into the Redis key
function sessionKey(sessionId: string) {
  return `${SESSION_PREFIX}${sessionId}`;
}

// Core helper: given a session ID, load it from Redis
async function getSessionById(
  sessionId: string
): Promise<SessionData | undefined> {
  const key = sessionKey(sessionId);
  const json = await redis.get(key);
  if (!json) return undefined;
  console.log("session json", json)

  try {
    return json as SessionData
  } catch (e) {
    console.error("Failed to parse session JSON from Redis", e);
    return undefined;
  }
}

function unsignExpressCookie(
  signedCookieValue: string,
  secret: string
): string | null {
  let value = signedCookieValue;

  // In case it's URL-encoded somewhere, decode it
  try {
    value = decodeURIComponent(value);
  } catch {
    // ignore decode failures and just use the original
  }

  if (!value.startsWith("s:")) {
    // Not signed; treat whole value as session ID
    return value;
  }

  // Strip off "s:" and let cookie-signature unsign the rest
  const unsigned = signature.unsign(value.slice(2), secret);
  if (unsigned === false) return null;

  return unsigned;
}



export async function getSessionFromNextRequest(): Promise<SessionData | undefined> {
  const cookieStore = await cookies();  
  const raw = cookieStore.get("connect.sid")?.value;
  if (!raw) return undefined;

  const secret = process.env.SESSION_SECRET;
  const id = unsignExpressCookie(raw, secret as string);
  if (!id) return undefined;

  return getSessionById(id);
}
