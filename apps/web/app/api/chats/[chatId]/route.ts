import { NextRequest, NextResponse } from "next/server";
import { SessionData, ChatMessage } from "@ethos/shared";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";
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



export async function GET(req: NextRequest, context: { params: Promise<{ chatId: string }> }) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { chatId } = await context.params;
    if (!chatId || !/^\d+$/.test(chatId)) {
      return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
    }
    const { data, status } = await serverApiFetch<ChatMessage[]>(`/chats/${chatId}/messages`)
    return NextResponse.json(data, { status });
  } catch (err) {
    console.error("Route failure", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest, context: { params: Promise<{ chatId: string }> }) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await context.params;

    const { data, status } = await serverApiFetch<ChatMessage>(`/chats/${chatId}`, {
      method: "POST"
    })
    return NextResponse.json(data, { status })

  } catch (err) {
    console.error("Route failure", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: any) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.userId) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }
    const { chatId } = await params;
    const chatIdNum = Number(chatId);
    if (!chatId || Number.isNaN(chatIdNum)) {
      return NextResponse.json({ message: "invalid chat id" }, { status: 400 });
    }
    const body = await req.json();
    const resp = await fetch(`${process.env.API_BASE_URL}/chats/${chatIdNum}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.userId.toString(),
      },
      body: JSON.stringify(body)
    });
    const data = await resp.json().catch(() => null);
    return NextResponse.json({ data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ message: "error" })
  }
}
