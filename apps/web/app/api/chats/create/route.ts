import { NextRequest, NextResponse } from "next/server";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";
import { SessionData } from "@/apps/web/lib/session";


const API_BASE_URL = process.env.API_BASE_URL

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();

    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const response = await fetch(`${API_BASE_URL}/chats/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session.user.id,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    const res = NextResponse.json(data, { status: response.status });

    return res;
  } catch (err) {
    console.error(err); //
    return NextResponse.json({ error: "API Unreachable" }, { status: 502 })
  }

}
