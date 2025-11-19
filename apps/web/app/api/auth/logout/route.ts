// apps/web/app/api/auth/logout/route.ts (App Router)
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL! ?? "http://localhost:4000"; // env handles dev vs prod

export async function POST(req: NextRequest) {
  // Forward the cookie header so Express knows which session to destroy
  const cookieHeader = req.headers.get("cookie") ?? "";

  let upstream;
  try {
    upstream = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
      },
    });
  } catch (err) {
    console.error("Error calling API /auth/logout:", err);
    // We'll still clear on the client if Express is unreachable
    const res = NextResponse.json(
      { ok: false, message: "logout failed (api unreachable)" },
      { status: 502 },
    );
    return res;
  }

  const data = await upstream.json();
  const res = NextResponse.json(data, { status: upstream.status });

  // ★ Forward Express's Set-Cookie that clears the cookie
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}
