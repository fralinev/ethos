import Image from "next/image";
import { redirect } from "next/navigation";
import { getApiUrl } from "../../lib/getApiUrl";
import { getSessionFromNextRequest } from '../../lib/session'
import { SessionData } from "@/packages/shared/session";

function isAuthenticated(session?: SessionData): boolean {
  if (session?.user) return true
  return false
}

export default async function Home() {
  const session = await getSessionFromNextRequest();
  const authed = isAuthenticated(session);
  if (!authed) redirect("/login");

  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: "100px" }}>ETHOS</div>
      {/* <div>API: {health.status}</div> */}
      {/* <div>DB: {JSON.stringify(dbCheck)}</div> */}
    </div>
  );
}
