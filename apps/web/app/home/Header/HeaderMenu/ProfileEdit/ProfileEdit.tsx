"use client";

import { useState } from "react";
import styles from "./ProfileEdit.module.css";
import type { Profile } from "@ethos/shared"

export default function ProfileEdit({ profile, onSave }: any) {
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
            placeholder="Ada Lovelace"
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
            placeholder="https://..."
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
            placeholder="Short and precise."
            rows={4}
            className={styles.textarea}
          />
        </label>
      </div>

      <div className={styles.actions}>
        <button onClick={() => onSave(form)} className={styles.button}>Save</button>
      </div>
    </section>
  );
}
