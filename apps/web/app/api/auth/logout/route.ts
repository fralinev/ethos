import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL

export async function POST(req: NextRequest) {
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
    const res = NextResponse.json(
      { ok: false, message: "logout failed (api unreachable)" },
      { status: 502 },
    );
    return res;
  }
  const data = await upstream.json();
  const res = NextResponse.json(data, { status: upstream.status });
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}
