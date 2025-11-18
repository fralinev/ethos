// apps/web/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

// Make sure this is set in apps/web/.env (or your env system)
// ETHOS_API_URL=https://ethos-api-xxxxx.onrender.com
const API_BASE_URL = process.env.ETHOS_API_URL ?? "http://localhost:4000"

export async function POST(req: NextRequest) {
  try {
    if (!API_BASE_URL) {
      console.error("ETHOS_API_URL is not set");
      return NextResponse.json(
        { ok: false, message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { ok: false, message: "please provide username and password" },
        { status: 400 }
      );
    }

    // Server-to-server call from Next → Express
    const apiRes = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Browser cookies are irrelevant here; this is backend → backend
      body: JSON.stringify({ username, password }),
    });

    const data = await apiRes.json().catch(() => null);

    if (!apiRes.ok || !data?.ok) {
      const message =
        data?.message || data?.error || "Login failed on API server";
      return NextResponse.json(
        { ok: false, message },
        { status: apiRes.status || 500 }
      );
    }

    const { user, sessionId } = data;

    if (!sessionId) {
      console.error("API login succeeded but no sessionId returned");
      return NextResponse.json(
        { ok: false, message: "Login failed: missing sessionId" },
        { status: 500 }
      );
    }

    // Build the response to the browser
    const res = NextResponse.json(
      {
        ok: true,
        message: "logged in",
        user,
      },
      { status: 200 }
    );

    // 🔑 Set the cookie on the WEB origin
    // The name "connect.sid" matches what your Redis store expects (sess:<sid>)
    res.cookies.set("connect.sid", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day in seconds
    });

    return res;
  } catch (err) {
    console.error("Error in Next /api/auth/login:", err);
    return NextResponse.json(
      { ok: false, message: "internal service error" },
      { status: 500 }
    );
  }
}
