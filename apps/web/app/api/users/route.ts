import { NextRequest, NextResponse } from "next/server";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";
import { SessionData } from "@ethos/shared"

const API_BASE_URL = process.env.API_BASE_URL

export async function GET(req: Request) {
  const session: SessionData | undefined = await getSessionFromNextRequest();
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  console.log("SESSION", session)

  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")
  const params = new URLSearchParams({
    q: query ?? "",
    limit: "10",
    offset: "0"

  })

  if (!query) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        "x-user-id": session.user.id,
      }
    })

    const data = await response.json();
    const res = NextResponse.json(data, { status: response.status });
    return res;

  } else {
    const response = await fetch(`${API_BASE_URL}/users?${params}`, {
      headers: {
        "x-user-id": session.user.id,
      },
    })
    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })
    return res
  }



}
