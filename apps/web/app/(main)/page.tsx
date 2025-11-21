import { getSessionFromNextRequest } from '../../lib/session'
import { SessionData } from "@/packages/shared/session";
import Badge from "./Badge";
import WsTestPage from "../test/page";
import { getApiUrl } from '../../lib/getApiUrl';
import RightSidebar from '../components/sidebars/RightSidebar';
import LeftSidebar from '../components/sidebars/LeftSidebar';
import styles from "./page.module.css"
import Header from '../components/Header';
import clsx from "clsx";

function isAuthenticated(session?: SessionData): boolean {
  if (session?.user) return true
  return false
}

export default async function Home() {
  // const res = await fetch(`${getApiUrl()}/health`, { cache: "no-store" });
  // const initialHealth = await res.json();
  const session: SessionData | undefined = await getSessionFromNextRequest();
  const authed = isAuthenticated(session);
  // if (!authed) redirect("/login");

  return (
    // <div>

    //   {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: "100px" }}>ETHOS</div> */}
    //   {/* <Badge username={session ? session?.user?.username : "guest"}/> */}
    //   {/* <WsTestPage/> */}
    //   {/* <div>API: {health.status}</div> */}
    //   {/* <div>DB: {JSON.stringify(dbCheck)}</div> */}
    // </div>
     
    <div className={styles.page}>
      <Header />

      <div className={styles.layout}>
        <aside className={clsx(styles.sidebar, styles.sidebarLeft)}>
          <LeftSidebar session={session}/>
        </aside>

        <main className={styles.main}>
          {/* Chat transcript + input will go here */}
          <div>Center content (chat)</div>
        </main>

        <aside className={clsx(styles.sidebar, styles.sidebarRight)}>
          <RightSidebar initialHealth={"OK"}/>
        </aside>
      </div>
    </div>
  
  );
}
