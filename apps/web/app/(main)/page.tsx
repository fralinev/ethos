import { getSessionFromNextRequest } from '../../lib/session'
import { SessionData } from "@/packages/shared/session";
import Badge from "./Badge";
import WsTestPage from "../test/page";

function isAuthenticated(session?: SessionData): boolean {
  if (session?.user) return true
  return false
}

export default async function Home() {
  const session = await getSessionFromNextRequest();
  console.log("home session", session)
  const authed = isAuthenticated(session);
  // if (!authed) redirect("/login");

  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: "100px" }}>ETHOS</div>
      <Badge username={session ? session?.user?.username : "guest"}/>
      <WsTestPage/>
      {/* <div>API: {health.status}</div> */}
      {/* <div>DB: {JSON.stringify(dbCheck)}</div> */}
    </div>
  );
}
