import { getSessionFromNextRequest } from "@/apps/web/lib/session";
import { SessionData } from "@ethos/shared";
import { NextResponse } from "next/server";
import { serverApiFetch } from "@/apps/web/lib/serverApiFetch";

export async function POST(req: Request) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("avatar") as File;
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", file);

    const { data, status } = await serverApiFetch(`/profiles/avatar`, {
      method: "POST",
      body: uploadFormData,
    });

    return NextResponse.json(data, { status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Unknown" }, { status: 500 });
  }
}