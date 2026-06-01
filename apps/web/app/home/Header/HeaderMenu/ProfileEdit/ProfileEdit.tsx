"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./ProfileEdit.module.css";
import type { Profile } from "@ethos/shared"
import Spinner from "../../../components/Spinner";
import { SiLichess } from "react-icons/si";
import profileStyles from "../Profile/Profile.module.css"



export default function ProfileEdit({ profile, onSave, onCancel, loading }: { profile: Profile, onSave: (form: Profile, file?: File) => void, onCancel: () => void, loading: boolean }) {
  const [form, setForm] = useState(profile)
  const [file, setFile] = useState<File | null>(null)
  const previewURL = file ? URL.createObjectURL(file) : form.avatarURL
  console.log("avatarURL type:", typeof form.avatarURL, "value:", JSON.stringify(form.avatarURL))



  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log("FILE", file)
  }, [file])

  return (
    <section className={profileStyles.card}>
      <header className={profileStyles.header}>
        <h1 className={profileStyles.title}>Profile</h1>
        <SiLichess size="40" />

      </header>

      <div className={profileStyles.fields}>

        <div className={profileStyles.field}>
          <span className={profileStyles.label}>Avatar</span>
          <div className={styles.avatarUpload}>
            {previewURL
              ? <img src={previewURL} className={styles.avatarPreview} alt="avatar preview" />
              : null
            }
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />
            <button className={styles.uploadButton} onClick={() => fileInputRef.current?.click()}>
              Upload picture
            </button>
          </div>
        </div>


        <label className={profileStyles.field}>
          <span className={profileStyles.label}>Full name</span>
          <input
            value={form.fullName}
            onChange={(e) => setForm((prev: Profile) => ({
              ...prev,
              fullName: e.target.value
            }))}
            className={styles.input}
          />
        </label>



        <label className={profileStyles.field}>
          <span className={profileStyles.label}>Bio</span>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((prev: Profile) => ({
              ...prev,
              bio: e.target.value
            }))}
            rows={4}
            className={styles.textarea}
          />
        </label>
      </div>

      <div className={styles.actions}>
        <button onClick={onCancel} className={styles.button}>Cancel</button>
        <div>{loading ? <Spinner /> : <button onClick={() => onSave(form, file ?? undefined)} className={styles.button}>Save</button>}</div>
      </div>
    </section>
  );
}
