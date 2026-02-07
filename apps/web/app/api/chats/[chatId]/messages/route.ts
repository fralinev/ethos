import { NextRequest, NextResponse } from "next/server";
import { SessionData } from "@ethos/shared";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";



export async function POST(req: NextRequest, context: any) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();

    if (!session?.user) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const { chatId } = await context.params;

    const chatIdNum = Number(chatId);

    if (!chatId || Number.isNaN(chatIdNum)) {
      return NextResponse.json({ message: "invalid chat id" }, { status: 400 });
    }

    const body = await req.json();

    const resp = await fetch(`${process.env.API_BASE_URL}/chats/${chatIdNum}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.user.id.toString(),
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => null);

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("BFF /api/chats/[chatId]/messages POST error:", err);
    return NextResponse.json({ message: "unknown" }, { status: 500 });
  }
}
