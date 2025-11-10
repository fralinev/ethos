import Image from "next/image";

export default async function Home() {
  // const apiUrl = process.env.API_URL ?? "http://localhost:4000";

  // let status = "unknown";
  // try {
  //   const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
  //   if (res.ok) {
  //     const json = await res.json();
  //     status = json.status ?? "ok";
  //   } else {
  //     status = `api returned ${res.status}`;
  //   }
  // } catch (err) {
  //   status = "unavailable";
  // }
  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: "100px" }}>HELLO WORLD</div>
      {/* <div>{status}</div> */}
    </div>
  );
}
