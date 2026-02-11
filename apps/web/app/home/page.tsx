import { getSessionFromNextRequest } from "../../lib/session";
import styles from "./page.module.css";
import Header from "./Header/Header";
import { redirect } from "next/navigation";
import type { Chat, SessionData, AuthedSession, User } from "@ethos/shared"
import LayoutShell from "./LayoutShell/LayoutShell";
import { apiFetch } from "../../lib/apiFetch";

type HomeProps = {
  searchParams: Promise<{
    chatId?: string;
    chatName?: string
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session: SessionData | AuthedSession | undefined = await getSessionFromNextRequest();

  if (!session?.user) {
    redirect("/")
  }

  const { chatId } = await searchParams;
  const activeChatId: string | undefined = chatId ? chatId : undefined;
  let initialChats: Chat[] = [];
  let initialUsers: User[] = [];

  try {
    initialChats = await apiFetch(`${process.env.API_BASE_URL}/chats`, {
      headers: { "x-user-id": session.user.id },
      cache: "no-store"
    })
    initialUsers = await apiFetch(`${process.env.API_BASE_URL}/users`, {
      headers: { "x-user-id": session.user.id },
      cache: "no-store"
    })
  } catch (err) {
    console.error("Error fetching chats:", err);
  }

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.layout}>
        <LayoutShell
          initialChats={initialChats}
          initialUsers={initialUsers}
          session={session}
          activeChatId={activeChatId}
        />
      </div>
    </div>
  );
}
