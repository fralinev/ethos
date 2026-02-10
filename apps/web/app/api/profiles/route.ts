import { getSessionFromNextRequest } from "@/apps/web/lib/session";
import { SessionData } from "@ethos/shared";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const response = await fetch(`${process.env.API_BASE_URL}/profiles/${session.user.id}`, {
      headers: {
        cookie: req.headers.get("cookie") ?? ""
      }
    })
    const data = await response.json();
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "unknown" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const response = await fetch(`${process.env.API_BASE_URL}/profiles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        userId: session.user.id
      })
    })
    const data = await response.json();
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "unknown" }, { status: 500 });
  }
}