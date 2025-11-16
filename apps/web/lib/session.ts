"use server";

import { cookies } from "next/headers";
import { getSessionById, unsignExpressCookie } from "@/packages/shared/session";
import { SessionData } from "@/packages/shared/session";

export async function getSessionFromNextRequest(): Promise<SessionData | undefined> {
  const cookieStore = await cookies();  
  console.log("cookieStore", cookieStore)           
  const raw = cookieStore.get("connect.sid")?.value;
  if (!raw) return undefined;

  const secret = process.env.SESSION_SECRET!;
  const id = unsignExpressCookie(raw, secret);
  if (!id) return undefined;

  return getSessionById(id);
}
