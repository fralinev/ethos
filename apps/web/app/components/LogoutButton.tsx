"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login"); // ✔️ works only in client components
  }

  return <button style={{cursor: "pointer"}} onClick={handleLogout}>Logout</button>;
}
