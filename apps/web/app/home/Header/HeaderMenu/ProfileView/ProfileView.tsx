"use client";

import { useState } from "react";
import styles from "./ProfileView.module.css";
import { RiEditFill } from "react-icons/ri";
import type { Profile } from "@ethos/shared"

export default function ProfileView({ profile, setMode}: { profile: Profile, setMode: React.Dispatch<React.SetStateAction<string>> }) {

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <div className={styles.avatarPreview} aria-hidden />


      </header>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>Full name</span>
          <div>{profile.fullName}</div>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Avatar URL</span>
          <div>{profile.avatarURL}</div>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Bio</span>
          <div>{profile.bio}</div>
        </label>
      </div>

      <div className={styles.actions}>
        <button className={styles.button} onClick={() => setMode("edit")}>Edit</button>
      </div>
    </section>
  );
}
