import { getSessionFromNextRequest } from '../../lib/session'
import { SessionData } from "@/packages/shared/session";
import RightSidebar from '../components/sidebars/RightSidebar';
import LeftSidebar from '../components/sidebars/LeftSidebar';
import styles from "./page.module.css"
import Header from '../components/Header';
import clsx from "clsx";

type Chat = {
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
};

export default async function Home() {
  // const res = await fetch(`${getApiUrl()}/health`, { cache: "no-store" });
  // const initialHealth = await res.json();
  const session: SessionData | undefined = await getSessionFromNextRequest();

  let chats: Chat[] = [];
  if (session?.user) {
    try {
      console.log("CHECKK")
      const response = await fetch(`${process.env.API_BASE_URL}/chats`, {
        headers: {
          "x-user-id": session.user.id.toString(),
        },
        cache: "no-store",
      });

      if (!response.ok) {
        console.error("Failed to fetch chats:", response.status, response.statusText);
      } else {
        chats = await response.json();
        console.log("CHECKK 2 chats", chats)
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  }

  return (

    <div className={styles.page}>
      <Header />

      <div className={styles.layout}>
        <aside className={clsx(styles.sidebar, styles.sidebarLeft)}>
          <LeftSidebar session={session} chats={chats} />
        </aside>

        <main className={styles.main}>
          {/* Chat transcript + input will go here */}
          <div>Center content (chat)</div>
        </main>

        <aside className={clsx(styles.sidebar, styles.sidebarRight)}>
          <RightSidebar initialHealth={"OK"} />
        </aside>
      </div>
    </div>

  );
}
