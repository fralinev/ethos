"use client"
import { useRouter } from "next/navigation"

export default function HeaderLogin() {
  const router = useRouter();

  return (
    <><button style={{ cursor: "pointer" }} onClick={() => router.push("/login")}>Login</button></>
  )
}