"use client"
import styles from "./authwrapper.module.css"
import { useState } from "react"
import LoginPage from "../login/page";
import SignupPage from "../signup/page";

export default function AuthWrapper({ session }: { session: any }) {
  const [string, setString] = useState<string | null>(null);

  const onCancel = () => {
    setString(null)
  }
  
  return (
    <div>
      <div>
        {session?.user && string === null && <button>back to app</button>}
      </div>
      <div style={{margin: "32px 0 0 0"}} >
        {!session?.user && string === null && <div className={styles.authButtons}>
          <button onClick={() => setString("login")}>Login</button>
          <button onClick={() => setString("signup")}>Signup</button>
          </div>}
      </div>
      {string === "login" && <LoginPage onCancel={onCancel}/>}
      {string === "signup" && <SignupPage onCancel={onCancel}/>}
    </div>
  )
}