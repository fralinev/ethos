import { NextRequest, NextResponse } from "next/server";
import { SessionData } from "@/apps/web/lib/session";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";


export async function GET(req: NextRequest, context:any) {
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

    const resp = await fetch(`${process.env.API_BASE_URL}/chats/${chatIdNum}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.user.id.toString(),
      },
    });

    const data = await resp.json().catch(() => null);

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("errz", err);
    return NextResponse.json({ message: "unknown" }, { status: 500 });
  }
}



export async function DELETE(req: NextRequest, context: any) {
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

    const resp = await fetch(`${process.env.API_BASE_URL}/chats/${chatIdNum}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.user.id.toString(),
      },
    });

    const data = await resp.json().catch(() => null);

    return NextResponse.json(data, { status: resp.status });
  } catch (err) {
    console.error("BFF /api/chats/[chatId] POST error:", err);
    return NextResponse.json({ message: "unknown" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: any) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.user) {
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
        "x-user-id": session.user.id.toString(),
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
