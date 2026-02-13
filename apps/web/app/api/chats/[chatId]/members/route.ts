import { NextRequest, NextResponse } from "next/server";
import { SessionData } from "@ethos/shared";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";



export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    const response = await fetch(`${process.env.API_BASE_URL}/chats/${chatId}/members`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.userId,
      },
    })
    const data = await response.json();
    return NextResponse.json({data})

  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "error posting to :chatId" })
  }
}
