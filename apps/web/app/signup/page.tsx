"use client"

import { useState } from "react"
import { getApiUrl } from "../../lib/getApiUrl"
import { redirect } from "next/navigation";
import SectionHeader from "../components/SectionHeader";
import { useRouter, } from "next/navigation";




import styles from "./signup.module.css"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [statusText, setStatusText] = useState("")

  const router = useRouter();

  

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await fetch(`${getApiUrl()}/auth/signup`, {
      cache: "no-store",
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    if (res) {
      const data = await res.json();
      setStatusText(data.message)
      if (data.ok) {
        router.push("/login")
      }
    }
  }
  return (
    <div className={styles.signupWrapper}>
      <div className={styles.signup}>
        <SectionHeader text="Create new user" />

        <form className="flex flex-col gap-10 pt-5" onSubmit={handleSignup}>
          <div id="signup-input-fields" className={styles.authInputFields}>
            <div>
              <label htmlFor="username">username: </label>
              <input
                type="text"
                id="username"
                name="username"
                className={styles.signupInput}
                onChange={handleUsernameChange}
                value={username}
              />
            </div>
            <div>
              <label htmlFor="password">password: </label>
              <input
                type="password"
                id="password"
                name="password"
                className={styles.signupInput}
                onChange={handlePasswordChange}
                value={password}
              />
            </div>
          </div>
          <div id="signup-buttons" className={styles.authButtons}>
            <button className={styles.authButton} type="button" onClick={() => router.push("/login")}>← Back to login</button>
            <button className={styles.authButton} type="submit">Create</button>
          </div>
          <div>
            <h4 style={{padding: "0 0 10px 0"}}>{statusText}</h4>
          </div>
        </form>
      </div>
    </div>
  )
}