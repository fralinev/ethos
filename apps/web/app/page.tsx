import Image from "next/image";

async function fetchSafe(url: string, ms = 1500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    if (!r.ok) return { status: `api ${r.status}` };
    return await r.json();
  } catch {
    return { status: "unavailable" };
  } finally {
    clearTimeout(t);
  }
}
export default async function Home() {
  const apiUrl = process.env.API_URL ?? "http://localhost:4000";
  const health = await fetchSafe(`${apiUrl}/health`);

  
  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: "100px" }}>ETHOS</div>
      <div>{health.status}</div>
    </div>
  );
}
