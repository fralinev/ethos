"use client"

import { useState } from "react"
import { getApiUrl } from "../../lib/getApiUrl"
import { redirect } from "next/navigation";


import styles from "./login.module.css"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [statusText, setStatusText] = useState("")

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await fetch(`${getApiUrl()}/auth/login`, {
      cache: "no-store",
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
    });
    if (res) {
      const data = await res.json();
      setStatusText(data.message)
      if (data.ok) {
        redirect("/")
      }
    }
  }
  const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    redirect("/signup")
  }
  return (
    <div className={styles.login}>
      <main>
        <div>
          <h1>login</h1>
          <form className="flex flex-col gap-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username">username: </label>
              <input
                type="text"
                id="username"
                name="username"
                className={styles.loginInput}
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
                className={styles.loginInput}
                onChange={handlePasswordChange}
                value={password}
              />
            </div>
            <div>
              <button className={styles.loginButton} type="submit">login</button>
              <button className={styles.loginButton} type="button" onClick={handleSignup}>signup</button>
            </div>
            <div>
              <h4>{statusText}</h4>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}