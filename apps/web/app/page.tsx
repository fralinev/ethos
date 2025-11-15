import Image from "next/image";
import { redirect } from "next/navigation";
import { getApiUrl } from "../lib/getApiUrl";


async function isAuthenticated(): Promise<boolean> {
  // 🔒 Later: read cookies/headers or call your API.
  // Keep this fast and server-side only.
  return true; // currently treat everyone as unauthenticated
}


async function fetchSafe(url: string, ms = 1500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { cache: "no-store", signal: ctrl.signal });
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
  const authed = await isAuthenticated();
  if (!authed) redirect("/login");
  // const apiBase = getApiUrl();
  const apiUrl = getApiUrl();
  const health = await fetchSafe(`${apiUrl}/health`, 3000);
  // const dbCheck = await fetchSafe(`${apiBase}/dbcheck`, 3000);

  
  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: "100px" }}>ETHOS</div>
      <div>API: {health.status}</div>
      {/* <div>DB: {JSON.stringify(dbCheck)}</div> */}
    </div>
  );
}
