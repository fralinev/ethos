import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  if (!process.env.API_BASE_URL) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  let upstream;
  try {
    upstream = await fetch(`${process.env.API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Logout failed" },
      { status: 502 },
    );

  }
  let data;
  try {
    data = await upstream.json();
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid upstream response" },
      { status: 502 }
    );
  }
  const res = NextResponse.json(data, { status: upstream.status });
  const setCookie = upstream.headers.get("set-cookie");
  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }
  return res;
}
