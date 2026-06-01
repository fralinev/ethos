import { getSessionFromNextRequest } from "../../lib/session";
import styles from "./page.module.css";
import Header from "./Header/Header";
import { redirect } from "next/navigation";
import type { Chat, SessionData, AuthedSession, User } from "@ethos/shared"
import LayoutShell from "./LayoutShell/LayoutShell";
import { apiFetch } from "../../lib/apiFetch";
import { UserProvider } from "../context/UserContext";
import { cookies } from "next/headers";
import Providers from "../context/Providers";

type HomeProps = {
  searchParams: Promise<{
    chatId?: string;
    chatName?: string
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session: SessionData | undefined = await getSessionFromNextRequest();
  if (!session?.userId) {
    redirect("/")
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const { chatId } = await searchParams;
  const activeChatId: string | undefined = chatId ? chatId : undefined;

  const [currentUser, initialChats, initialUsers] = await Promise.all([
    apiFetch<User>(`${process.env.API_BASE_URL}/users/${session.userId}`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    }),
    apiFetch<Chat[]>(`${process.env.API_BASE_URL}/chats`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    }),
    apiFetch<User[]>(`${process.env.API_BASE_URL}/users`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    }),
  ]);

  let activeChat = activeChatId ? initialChats.find((chat: Chat) => chat.id === activeChatId) : undefined;
  if (activeChatId && !activeChat) {
    try {
      activeChat = await apiFetch<Chat>(`${process.env.API_BASE_URL}/chats/${activeChatId}`, {
        headers: { Cookie: cookieHeader },
        cache: "no-store",
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Providers user={currentUser}>
      <div className={styles.page}>
        <Header />
        <div className={styles.layout}>
          <LayoutShell
            initialChats={initialChats}
            initialUsers={initialUsers}
            activeChat={activeChat}
            session={session}
            activeChatId={activeChatId}
          />
        </div>
      </div>
    </Providers>
  );
}
