"use server";

import { cookies } from "next/headers";
import { redis } from "@/packages/shared/src/redisClient";
import signature from "cookie-signature";
import { SessionData } from "@ethos/shared"

const SESSION_PREFIX = "sess:";





function sessionKey(sessionId: string) {
  return `${SESSION_PREFIX}${sessionId}`;
}

async function getSessionById(
  sessionId: string
): Promise<SessionData | undefined> {
  const key = sessionKey(sessionId);
  const json = await redis.get(key);
  if (!json) return undefined;

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

  try {
    value = decodeURIComponent(value);
  } catch {
  }

  if (!value.startsWith("s:")) {
    return value;
  }

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
