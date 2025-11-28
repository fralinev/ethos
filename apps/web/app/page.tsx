import { getSessionFromNextRequest } from "../lib/session";
import { SessionData } from "../lib/session";
import RightSidebar from "./components/sidebars/RightSidebar";
import LeftSidebar from "./components/sidebars/LeftSidebar";
import ChatTranscript from "./components/ChatTranscript";
import styles from "./page.module.css";
import Header from "./components/Header";
import clsx from "clsx";

export type Chat = {
  id: number;
  name: string;
  createdAt: string;
  createdBy: {
    id: number;
    username: string;
  } | null;
  members: {
    id: number;
    username: string;
  }[];
  newName?: string
};

export type Message = {
  id: number;
  chatId: number;
  body: string;
  createdAt: string;
  sender: {
    id: number;
    username: string;
  };
};

type HomeProps = {
  searchParams: Promise<{
    chatId?: string;
    chatName?: string | undefined
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const session: SessionData | undefined = await getSessionFromNextRequest();

  const { chatId, chatName } = await searchParams;
  const currentChatId: number | undefined =
    chatId && !Number.isNaN(Number(chatId)) ? Number(chatId) : undefined;
  console.log("ccid home", currentChatId)
  let initialChats: Chat[] = [];

  if (session?.user) {
    try {
      const response = await fetch(`${process.env.API_BASE_URL}/chats`, {
        headers: {
          "x-user-id": session.user.id.toString(),
        },
        cache: "no-store",
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
  let messages: Message[] = [];

  if (session?.user && currentChatId) {
    try {
      const resp = await fetch(
        `${process.env.API_BASE_URL}/chats/${currentChatId}/messages`,
        {
          headers: {
            "x-user-id": session.user.id.toString(),
          },
          cache: "no-store",
        }
      );

      if (!resp.ok) {
        console.error(
          "Failed to fetch messages:",
          resp.status,
          resp.statusText
        );
      } else {
        messages = await resp.json();
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.layout}>
        <aside className={clsx(styles.sidebar, styles.sidebarLeft)}>
          <LeftSidebar
            session={session}
            initialChats={initialChats}
            currentChatId={currentChatId} />
        </aside>

        <main className={styles.main}>
          <ChatTranscript
            session={session}
            currentChatId={currentChatId}
            chatName={chatName}
            initialMessages={messages}
          />
        </main>

        <aside className={clsx(styles.sidebar, styles.sidebarRight)}>
          <RightSidebar initialHealth={"OK"} />
        </aside>
      </div>
    </div>
  );
}
