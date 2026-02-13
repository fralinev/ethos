import { NextRequest, NextResponse } from "next/server";


const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

export const prepareRequest = (options:any) => {

if (!process.env.API_BASE_URL) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 }
    );
  }
  
}