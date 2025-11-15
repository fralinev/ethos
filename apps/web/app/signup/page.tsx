"use client"

import { useState } from "react"
import { getApiUrl } from "../../lib/getApiUrl"
import { redirect } from "next/navigation";


import styles from "./signup.module.css"

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
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("logging in...", username)
    const res = await fetch(`${getApiUrl()}/auth/signup`, {
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
            redirect("/login")
          }
        }
    console.log("SIGNUP response", res.statusText)
  }
  // const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   e.preventDefault()
  //   console.log("signing up...", username)
  // }
  return (
    <div className={styles.signup}>
      <main>
        <div>
          <h1>signup</h1>
          <form className="flex flex-col gap-5" onSubmit={handleSignup}>
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
            <div>
              <button className={styles.signupButton} type="submit">create user</button>
              {/* <button className={styles.loginButton} type="button" onClick={handleSignup}>signup</button> */}
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