import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL

export async function GET() {


  const response = await fetch(`${API_BASE_URL}/users`, {cache: "no-store"});

  const data = await response.json();
  const res = NextResponse.json(data, { status: response.status });

//   const setCookie = response.headers.get("set-cookie");
//   if (setCookie) {
//     res.headers.set("set-cookie", setCookie);
//   }

  return res;
}
