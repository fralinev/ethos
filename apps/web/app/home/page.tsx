import { getSessionFromNextRequest } from "../../lib/session";
import styles from "./page.module.css";
import Header from "./components/Header";
import { redirect } from "next/navigation";
import type { Chat, SessionData, AuthedSession } from "@ethos/shared"
import LayoutShell from "./LayoutShell";

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
  const activeChatId: string | undefined = chatId  ? chatId : undefined;
  let initialChats: Chat[] = [];

  if (session?.user) {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/chats`, {
        headers: {
          "x-user-id": session.user.id.toString(),
        },
        // next: { revalidate: 30}
        cache: "no-store"
      });

      if (!response.ok) {
        console.error(
          "Failed to fetch chats:",
          response.status,
          response.statusText
        );
      } else {
        initialChats = await response.json();
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  }

  const activeChat = activeChatId 
    ? initialChats.find(({id}) => id === activeChatId)
    : undefined
 
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.layout}>
        <LayoutShell 
        initialChats={initialChats} 
        session={session} 
        activeChatId={activeChatId} 
        />
      </div>
    </div>
  );
}
