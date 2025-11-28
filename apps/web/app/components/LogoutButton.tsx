"use client";

import type { SessionData } from "../../lib/session";

export default function LogoutButton({session}:{session?: SessionData}) {

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";  // full reload → cleanest
  }

  if (!session?.user) return (
    <button style={{ cursor: "pointer" }} onClick={() =>  window.location.href = "/login"}>Login</button>
  );

  return (
    <button style={{ cursor: "pointer" }} onClick={handleLogout}>
      Logout
    </button>
  );
}