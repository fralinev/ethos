"use client"

import { useState, useRef, useEffect } from "react"
import { TiEye } from "react-icons/ti";
import styles from "./Signup.module.css"
import { AUTH_ERRORS } from "@/packages/shared/src/constants";
import Spinner from "../home/components/Spinner";

export default function Signup({ setString }: { setString: React.Dispatch<React.SetStateAction<string>> }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordType, setPasswordType] = useState("password")
  const [errorText, setErrorText] = useState("")
  const [loading, setLoading] = useState(false)

  const timeoutRef = useRef<any>(null);
  const usernameRef = useRef<HTMLInputElement>(null)

  const USERNAME_REGEX = /^[A-Za-z]{3,15}$/;
  const PASSWORD_REGEX = /^.{8,64}$/;

  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isFormValid = () => {
    if (!username || !password) {
      setErrorText(AUTH_ERRORS.MISSING_FIELD)
      return false;
    }
    if (!USERNAME_REGEX.test(username)) {
      setErrorText(AUTH_ERRORS.INVALID_USERNAME)
      return false;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setErrorText(AUTH_ERRORS.INVALID_PASSWORD)
      return false;
    }
    return true;
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 15) return;
    setUsername(e.target.value)
  }
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 64) return;
    setPassword(e.target.value)
  }
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    if (!isFormValid()) return;
    try {
      setLoading(true)
      const res = await fetch("/api/auth/signup", {
        method: "POST",
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
      if (res.status === 201) {
        setErrorText("");
        setString("login");
        return;
      }
      if (res.status === 409) {
        setErrorText(data.message ?? AUTH_ERRORS.USER_ALREADY_EXISTS);
        return;
      }
      if (res.status === 400) {
        setErrorText(data.message ?? AUTH_ERRORS.MISSING_FIELD);
        return;
      }
      setErrorText(data.message ?? "Unknown error");
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
    <section className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Signup</h1>
      </header>
      <form onSubmit={handleSignup}>
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
            <small className="block my-5">Username must be 3 to 15 letters</small>
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
            <small className="block mt-5">Password must be 8 to 64 characters</small>

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
            disabled={loading || !username || !password}
          >Signup</button>
          {loading && <Spinner />}
        </div>
        {errorText && <div className={styles.errorText}>{errorText}</div>}
      </form>
    </section >
  )
}