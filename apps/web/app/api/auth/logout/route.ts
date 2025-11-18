import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";

export async function POST(req: NextRequest) {
  const sid = req.cookies.get("connect.sid")?.value;

  if (sid) {
    try {
      // Call Express and pass the cookie so express-session knows which session to destroy
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `connect.sid=${sid}`,
        },
      });
    } catch (err) {
      console.error("Error calling API /auth/logout:", err);
      // even if API call fails, we'll still clear the browser cookie
    }
  }

  // Clear the cookie on the WEB domain
  const res = NextResponse.json({ ok: true, message: "logged out" });

  res.cookies.set("connect.sid", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // delete
  });

  return res;
}