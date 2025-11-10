import Image from "next/image";

export default async function Home() {
  const apiUrl = process.env.API_URL ?? "http://localhost:4000";
  const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
  const data = await res.json();
  return (
    <div>
      
    <div style={{display: 'flex', justifyContent: 'center', marginTop: "100px"}}>HELLO WORLD</div>
    <div>{data.status}</div>
    </div>
  );
}
