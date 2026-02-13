import { NextRequest, NextResponse } from "next/server";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";
import { SessionData } from "@ethos/shared"
import { cookies } from "next/headers";


const API_BASE_URL = process.env.API_BASE_URL

export async function GET(req: Request) {
  const session: SessionData | undefined = await getSessionFromNextRequest();
  if (!session || !session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")
  const params = new URLSearchParams({
    q: query ?? "",
    limit: "10",
    offset: "0"

  })

  if (!query) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: { Cookie: cookieHeader }
    })

    const data = await response.json();
    const res = NextResponse.json(data, { status: response.status });
    return res;

  } else {
    const response = await fetch(`${API_BASE_URL}/users?${params}`, {
      headers: { Cookie: cookieHeader }
    })
    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })
    return res
  }



}
