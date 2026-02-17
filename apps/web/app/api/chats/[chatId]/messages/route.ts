import { NextRequest, NextResponse } from "next/server";
import { SessionData } from "@ethos/shared";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";
import { serverApiFetch } from "@/apps/web/lib/serverApiFetch";



export async function POST(req: NextRequest, context: any) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();

    if (!session?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await context.params;

    const chatIdNum = Number(chatId);

    if (!chatId || Number.isNaN(chatIdNum)) {
      return NextResponse.json({ message: "invalid chat id" }, { status: 400 });
    }

    const body = await req.json();

    const {data, status} = await serverApiFetch(`/chats/${chatIdNum}/messages`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(data, { status });
  } catch (err) {
    console.error("BFF /api/chats/[chatId]/messages POST error:", err);
    return NextResponse.json({ message: "unknown" }, { status: 500 });
  }
}
