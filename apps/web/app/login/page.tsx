"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation";
import SectionHeader from "../components/SectionHeader";
import { AUTH_ERRORS } from "../../../../packages/shared/src/constants"
import { TiEye } from "react-icons/ti";


import styles from "./login.module.css"

export default function LoginPage() {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorText, setErrorText] = useState("")
  const [passwordType, setPasswordType] = useState("password")

    const timeoutRef = useRef<any>(null);
  


  const router = useRouter();
  const isFormValid = () => {
      if (!username || !password) {
        setErrorText(AUTH_ERRORS.MISSING_FIELD)
        return false;
      } else return true;
  }

  
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorText("");
    if (!isFormValid()) return;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setErrorText(data?.message ?? "Login failed");
        return;
      }
      setErrorText(data.message ?? "logging in...");
      router.push("/");
    } catch (err) {
      console.error("Login error", err);
      setErrorText("Something went wrong logging in");
    }
  };
  const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    router.push("/signup");
  }


  const handleEyeClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (passwordType === "password") {
      setPasswordType("text");
      timeoutRef.current = setTimeout(() => {
        setPasswordType("password");
        timeoutRef.current = null;
      }, 2000);
    } else {
      setPasswordType("password");
    }
  };
  return (
    <div className={styles.loginWrapper}>
      <div className={styles.login}>
        <SectionHeader text="Login" />
        <form className="flex flex-col gap-10 pt-5" onSubmit={handleLogin}>
          <div id="login-input-fields" className={styles.authInputFields}>
            <div>
              <label htmlFor="username">Username: </label>
              <input
                type="text"
                id="username"
                name="username"
                className={styles.loginInput}
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="password">Password: </label>
              <div className="flex items-center relative w-full">
                <input
                  type={passwordType}
                  id="password"
                  name="password"
                  className={styles.loginInput}
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <span className="absolute right-1.5 cursor-pointer" onClick={handleEyeClick}><TiEye size={21} /></span>
              </div>
            </div>
          </div>
          <div id="login-buttons" className={styles.authButtons}>
            {/* <button className={styles.authButton} type="submit">← Home</button> */}
            <button className={styles.authButton} type="button" onClick={handleSignup}>Create new user</button>
            <button className={styles.authButton} type="submit">Login</button>

          </div>
          <div>
            <h4 style={{ padding: "0 0 10px 0" }}>{errorText}</h4>
          </div>
        </form>
      </div>
    </div>
  )
}