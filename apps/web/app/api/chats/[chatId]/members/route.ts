import { NextRequest, NextResponse } from "next/server";
import { SessionData } from "@ethos/shared";
import { getSessionFromNextRequest } from "@/apps/web/lib/session";
import { serverApiFetch } from "@/apps/web/lib/serverApiFetch";

type ApiErrorLike = {
  status?: number;
  message?: string;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const readApiError = (err: unknown): ApiErrorLike => {
  if (!isObject(err)) return {};
  return {
    status: typeof err.status === "number" ? err.status : undefined,
    message: typeof err.message === "string" ? err.message : undefined,
  };
};

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const session: SessionData | undefined = await getSessionFromNextRequest();
    if (!session?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    const { data, status } = await serverApiFetch(`/chats/${chatId}/members`, {
      method: "DELETE",
    })
    return NextResponse.json(data, { status })

  } catch (err) {
    const { status, message } = readApiError(err);
    if (status && status >= 400 && status < 500) {
      return NextResponse.json(
        { error: message ?? "Request failed" },
        { status }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Upstream service failure" }, { status: 502 });
  }
}
