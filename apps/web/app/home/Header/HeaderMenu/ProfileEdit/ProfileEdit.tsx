"use client";

import { useState } from "react";
import styles from "./ProfileEdit.module.css";
import type { Profile } from "@ethos/shared"
import Spinner from "../../../components/Spinner";

export default function ProfileEdit({ profile, onSave, onCancel, loading }: {profile: Profile, onSave: (form: Profile) => void, onCancel: () => void, loading: boolean}) {
  const [form, setForm] = useState(profile)

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <div className={styles.avatarPreview} aria-hidden />

      </header>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>Full name</span>
          <input
            value={form.fullName}
            onChange={(e) => setForm((prev: Profile) => ({
              ...prev,
              fullName: e.target.value
            }))}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Avatar URL</span>
          <input
            value={form.avatarURL}
            onChange={(e) => setForm((prev: Profile) => ({
              ...prev,
              avatarURL: e.target.value
            }))}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Bio</span>
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
        <div>{loading ? <Spinner/> : <button onClick={() => onSave(form)} className={styles.button}>Save</button>}</div>
      </div>
    </section>
  );
}
