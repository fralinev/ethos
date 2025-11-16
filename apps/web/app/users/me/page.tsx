"use client";

import { useEffect, useState } from "react";
import { getApiUrl } from "@/apps/web/lib/getApiUrl";

export default function MePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/auth/me`, {
          credentials: "include", // <-- browser sends connect.sid
        });

        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error("Error fetching /auth/me", e);
        setData({ error: "failed to fetch" });
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <h1>ME</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}