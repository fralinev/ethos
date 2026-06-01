"use client";

import { useState } from "react";
import styles from "./ProfileView.module.css";
import profileStyles from "../Profile/Profile.module.css"
import { RiEditFill } from "react-icons/ri";
import type { Profile } from "@ethos/shared"
import { SiLichess } from "react-icons/si";

export default function ProfileView({ profile, onEdit }: { profile: Profile, onEdit: () => void }) {
  console.log(profile)

  return (
    <section className={profileStyles.card}>
      <header className={profileStyles.header}>
        <h1 className={profileStyles.title}>Profile</h1>
        {profile.avatarURL ? <img className={styles.avatar} src={profile.avatarURL} /> : <SiLichess size="40" />}


      </header>


      <div className={profileStyles.fields}>

        {/* <label className={profileStyles.field}>
          <span className={profileStyles.label}>Avatar</span>
          <img className={styles.avatar} src={profile.avatarURL} />
        </label> */}

        <label className={profileStyles.field}>
          <span className={profileStyles.label}>Name</span>
          <div className={profileStyles.content}>{profile.fullName}</div>
        </label>


        <label className={profileStyles.field}>
          <span className={profileStyles.label}>Bio</span>
          <div className={profileStyles.content}>{profile.bio}</div>
        </label>
      </div>

      <div className={styles.actions}>
        <button className={styles.button} onClick={onEdit}>Edit</button>
      </div>
    </section>
  );
}
