"use client"

import { useState } from "react"
import { getApiUrl } from "../../lib/getApiUrl"
import { redirect } from "next/navigation";
import { useAppSelector, useAppDispatch } from "../../store/hooks"
import { setUser } from "../../store/slices/userSlice";
import { useRouter } from "next/navigation";


import styles from "./login.module.css"

export default function LoginPage() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [statusText, setStatusText] = useState("")

  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
  }
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatusText("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // same-origin by default; cookies will be stored automatically
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => null);
      console.log("login response", data);

      if (!res.ok || !data?.ok) {
        setStatusText(data?.message ?? "Login failed");
        return;
      }

      setStatusText(data.message ?? "logged in");

      // At this point:
      // - Next's /api/auth/login route has set the `connect.sid` cookie
      //   on the web domain
      // - Browser has stored that cookie (JS cannot see it because it's httpOnly)
      // - Now we can navigate to the home page, which will SSR using that cookie
      router.push("/");
    } catch (err) {
      console.error("Login error", err);
      setStatusText("Something went wrong logging in");
    }
  };
  const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    router.push("/signup");
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
      <button
        onClick={() =>
          dispatch(
            setUser({
              userId: "123",
              name: "Evan",
            })
          )
        }
      >SETUSER</button>
      <div style={{color: "white"}}>{user ? user.name : "no user"}</div>
    </div>
  )
}