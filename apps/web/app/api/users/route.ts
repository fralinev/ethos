import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const query = searchParams.get("query")
  const params = new URLSearchParams({
    q: query ?? "",
    limit: "10",
    offset: "0"

  })
  console.log("query", searchParams, query, req.url)

  if (!query) {
    const response = await fetch(`${API_BASE_URL}/users`, { cache: "no-store" });
    const data = await response.json();
    const res = NextResponse.json(data, { status: response.status });
    return res;

  } else {
    const response = await fetch(`${API_BASE_URL}/users?${params}`)
    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })
    return res
  }



}
