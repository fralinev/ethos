import { getSessionFromNextRequest } from "../../lib/session";
import styles from "./page.module.css";
import Header from "./Header/Header";
import { redirect } from "next/navigation";
import type { Chat, SessionData, AuthedSession, User } from "@ethos/shared"
import LayoutShell from "./LayoutShell/LayoutShell";
import { apiFetch } from "../../lib/apiFetch";
import { UserProvider } from "../context/UserContext";
import { cookies } from "next/headers";

type HomeProps = {
  searchParams: Promise<{
    chatId?: string;
    chatName?: string
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session: SessionData | undefined = await getSessionFromNextRequest();
  console.log("checkk HOME session", session)
  if (!session?.userId) {
    redirect("/")
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const { chatId } = await searchParams;
  const activeChatId: string | undefined = chatId ? chatId : undefined;

  // let initialChats: Chat[] = [];
  // let initialUsers: User[] = [];
  // let currentUser: User | null = null

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


  const activeChat = activeChatId ? initialChats.find((chat: Chat) => chat.id === activeChatId) : undefined

  return (
    <UserProvider user={currentUser}>
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
    </UserProvider>
  );
}
