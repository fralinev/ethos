"use client"
import styles from "./Authwrapper.module.css"
import { useState } from "react"
import Login from "./Login";
import Signup from "./Signup";
import { LuMoveRight } from "react-icons/lu";
import { useRouter } from "next/navigation";



export default function AuthWrapper({ session }: { session: any }) {
  const [string, setString] = useState<string | null>(null);

  const router = useRouter();

  function isSafari() {
    const ua = navigator.userAgent
    console.log("checkk", ua)
    return /^((?!chrome|android).)*safari/i.test(ua)
  }

  if (isSafari()) {
    document.body.innerHTML = `
    <div style="
      height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:sans-serif;
      background:#111;
      color:white;
    ">
      <div>
        <h1>Unsupported Browser</h1>
        <p>Please use Chrome or Firefox.</p>
      </div>
    </div>
  `
    throw new Error("Safari blocked")
  }

  const onCancel = () => {
    setString(null)
  }

  return (
    <div>
      <div>
        {session?.user && string === null &&
          <button
            className={styles.appRight}
            onClick={() => router.push("/home")}
          >
            App<LuMoveRight />
          </button>}
      </div>
      <div style={{ margin: "32px 0 0 0" }} >
        {!session?.user && string === null && <div className={styles.authButtons}>
          <button onClick={() => setString("login")}>Login</button>
          <button onClick={() => setString("signup")}>Signup</button>
        </div>}
      </div>
      {string === "login" && <Login onCancel={onCancel} />}
      {string === "signup" && <Signup setString={setString} onCancel={onCancel} />}
    </div>
  )
}