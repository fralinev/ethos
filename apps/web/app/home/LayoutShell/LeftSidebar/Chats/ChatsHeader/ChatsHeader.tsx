"use client"

import styles from "./ChatsHeader.module.css";



export default function ChatsHeader({ activeTab, onTabChange }:any) {
  return (
    <header className={styles.card}>
        <h2 className={styles.title}>Chats</h2>

      <div className={styles.tabGroup} role="tablist" aria-label="Chat type">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "direct"}
          className={`${styles.tab} ${activeTab === "direct" ? styles.tabActive : ""}`}
          onClick={() => onTabChange("direct")}
        >
          Direct
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "group"}
          className={`${styles.tab} ${activeTab === "group" ? styles.tabActive : ""}`}
          onClick={() => onTabChange("group")}
        >
          Group
        </button>
      </div>
    </header>
  );
}