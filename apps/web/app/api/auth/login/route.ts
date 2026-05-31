import { NextRequest, NextResponse } from "next/server";

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export async function POST(req: NextRequest) {
  if (!process.env.API_BASE_URL) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }

    let body: unknown;
  
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
  
    if (!isObject(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid upstream response" },
        { status: 502 }
      );
    }

    const cookieRes = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      cookieRes.headers.set("set-cookie", setCookie);
    }
    return cookieRes;
    
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Upstream request failed" }, {status: 502})
  }
}
