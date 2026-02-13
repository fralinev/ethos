import { apiFetch } from "@/apps/web/lib/apiFetch";
import { HttpError } from "@/packages/shared/dist";

export const getMessages = async (userId: string, activeChatId: string) => {
  if (userId && activeChatId) {
    try {
      const data = await apiFetch(
        `/api/chats/${activeChatId}`,
        { cache: "no-store" }
      );
      return data
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) {
        window.location.href = "/";
      } else {
        console.error(err)
      }
    }
  }
}
