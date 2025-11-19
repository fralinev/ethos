import Image from "next/image";
import { redirect } from "next/navigation";
import { getApiUrl } from "../../lib/getApiUrl";
import { getSessionFromNextRequest } from '../../lib/session'
import { SessionData } from "@/packages/shared/session";

function isAuthenticated(session?: SessionData): boolean {
  if (session?.user) return true
  return false
}


async function fetchSafe(url: string, config: object, ms = 1500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { cache: "no-store", signal: ctrl.signal, ...config });
    const json = await r.json();
    if (!r.ok) return { status: `api ${r.status}` };
    return json;
  } catch (err) {
    return { status: "unavailable" };
  } finally {
    clearTimeout(t);
  }
}
export default async function Home() {
  const session = await getSessionFromNextRequest();
  console.log("home session", session)
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
