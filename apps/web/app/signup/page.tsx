"use client"

import { useState, useRef } from "react"
import { getApiUrl } from "../../lib/getApiUrl"
import SectionHeader from "../components/SectionHeader";
import { useRouter, } from "next/navigation";
import { TiEye } from "react-icons/ti";
import styles from "./signup.module.css"
import { AUTH_ERRORS } from "@/packages/shared/src/constants";

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [passwordType, setPasswordType] = useState("password")
  const [errorText, setErrorText] = useState("")

  const router = useRouter();
  const timeoutRef = useRef<any>(null);

  const USERNAME_REGEX = /^[A-Za-z]{3,15}$/;
  const PASSWORD_REGEX = /^.{3,21}$/;

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
    setPassword(e.target.value)
  }
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isFormValid()) return;
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res) {
        const data = await res.json();
        setErrorText(data.message)
        console.log("checkk data", data)
        if (data.id) {
          router.push("/login")
        }
      }
    } catch (err) {
      console.error(err)
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
    <div className={styles.signupWrapper}>
      <div className={styles.signup}>
        <SectionHeader text="Create new user" />

        <form className="flex flex-col gap-10 pt-5" onSubmit={handleSignup}>
          <div id="signup-input-fields" className={styles.authInputFields}>
            <div >
              <label htmlFor="username">Username: </label>
              <input
                type="text"
                id="username"
                name="username"
                className={styles.signupInput}
                onChange={handleUsernameChange}
                value={username}
              />
              <small className="block my-5">Username must be 3 to 15 letters</small>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="password">Password: </label>
              <div className="flex items-center relative">
                <input
                  type={passwordType}
                  id="password"
                  name="password"
                  className={styles.signupInput}
                  onChange={handlePasswordChange}
                  value={password}
                />

                <span className="absolute right-1.5 cursor-pointer" onClick={handleEyeClick}><TiEye size={21} /></span>
              </div>

            </div>
            <small className="block mt-5">Password must be 3 to 21 characters</small>

          </div>
          <div id="signup-buttons" className={styles.authButtons}>
            <button className={styles.authButton} type="button" onClick={() => router.push("/login")}>← Back to login</button>
            <button className={styles.authButton} type="submit">Create</button>
          </div>
          <div>
            <h4 style={{ padding: "0 0 10px 0" }}>{errorText}</h4>
          </div>
        </form>
      </div>
    </div>
  )
}