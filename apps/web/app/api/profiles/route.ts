import { getSessionFromNextRequest } from "@/apps/web/lib/session";
import { serverApiFetch } from "@/apps/web/lib/serverApiFetch";
import { SessionData } from "@ethos/shared";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { data, status } = await serverApiFetch(`/profiles/${session.userId}`);
    return NextResponse.json(data, { status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Unknown" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { data, status } = await serverApiFetch(`/profiles`, {
      method: "POST",
      body: JSON.stringify({
        ...body,
        userId: session.userId
      })
    })
    return NextResponse.json(data, { status })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "unknown" }, { status: 500 });
  }
}
