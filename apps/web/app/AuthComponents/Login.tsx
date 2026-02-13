"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation";
import SectionHeader from "../home/components/SectionHeader";
import { AUTH_ERRORS } from "../../../../packages/shared/src/constants"
import { TiEye } from "react-icons/ti";
import styles from "./Login.module.css"
import { apiFetch } from "../../lib/apiFetch";
import Spinner from "../home/components/Spinner";
import { error } from "console";

export default function Login({ setString }: { setString: React.Dispatch<React.SetStateAction<string>> }) {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorText, setErrorText] = useState("")
  const [passwordType, setPasswordType] = useState("password")
  const [loading, setLoading] = useState(false)

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const usernameRef = useRef<HTMLInputElement>(null)

  const router = useRouter();

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 15) return;
    setUsername(e.target.value)
  }
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 64) return;
    setPassword(e.target.value)
  }


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorText("");
    try {
      setLoading(true)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setErrorText("Unexpected server response");
        return;
      }

      if (res.ok) {
        router.push("/home");
        return;
      }
      setErrorText(data.message);
    } catch (err) {
      console.error(err);
      setErrorText("Login failed");
    } finally {
      setLoading(false)
    }
  };

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
      }, 3000);
    } else {
      setPasswordType("password");
    }
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Login</h1>
      </header>
      <form onSubmit={handleLogin}>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span className={styles.label}>Username</span>
            <input
              ref={usernameRef}
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              className={styles.input}
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <div className="relative flex items-center">
              <input
                value={password}
                type={passwordType}
                id="password"
                onChange={handlePasswordChange}
                className={styles.input}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                className="flex items-center"
                onClick={handleEyeClick}>
                <TiEye className={`${styles.icon} cursor-pointer`} size={22} />
              </button>
            </div>
          </label>
        </div>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            style={{ cursor: "pointer" }}
            onClick={() => setString("")}
            className={styles.modalButton}
          >Cancel</button>
          <button
            type="submit"
            style={{ cursor: "pointer" }}
            className={styles.modalButton}
            disabled={!username || !password}
          >Login</button>
          {loading && <Spinner />}
        </div>
        {errorText && <div className={styles.errorText}>{errorText}</div>}
      </form>
    </section >
  )
}