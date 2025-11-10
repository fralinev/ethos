import Image from "next/image";

function getApiBase() {
  const host = process.env.API_HOST;
  const port = process.env.API_PORT;
  if (host && port) return `http://${host}:${port}`; // internal Render network
  if (process.env.API_URL) return process.env.API_URL; // optional public URL
  return "http://localhost:4000"; // local dev
}

async function fetchSafe(url: string, ms = 1500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    const json = await r.json()
    console.log("HEALTH CHECK", json)
    if (!r.ok) return { status: `api ${r.status}` };
    return await r.json();
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(t);
  }
}
export default async function Home() {
  const apiBase = getApiBase();
  const apiUrl = process.env.API_URL ?? "http://localhost:4000";
   console.log("API_BASE =", apiBase);
  const health = await fetchSafe(`${apiUrl}/health`, 3000);

  
  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: "100px" }}>ETHOS</div>
      <div>{health.status}</div>
    </div>
  );
}
