import { NextRequest, NextResponse } from "next/server";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";
import type { SessionData, Chat } from "@ethos/shared";
import { serverApiFetch } from "@/apps/web/lib/serverApiFetch";

type ApiErrorLike = {
  status?: number;
  message?: string;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const readApiError = (err: unknown): ApiErrorLike => {
  if (!isObject(err)) return {};
  return {
    status: typeof err.status === "number" ? err.status : undefined,
    message: typeof err.message === "string" ? err.message : undefined,
  };
};

export async function POST(req: NextRequest) {
  const session: SessionData | undefined = await getSessionFromNextRequest();
  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!isObject(body)) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const newChat = await serverApiFetch<Chat>("/chats/create", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({ newChat }, { status: 201 });
  } catch (err) {
    const { status, message } = readApiError(err);
    if (status && status >= 400 && status < 500) {
      return NextResponse.json(
        { error: message ?? "Request failed" },
        { status }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Upstream service failure" }, { status: 502 });
  }
}
