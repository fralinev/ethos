"use client"
import styles from "./About.module.css"

export default function About() {
    return (
        <div>
            <div className={styles.wrapper}>
                <h1 className={styles.header}>Welcome</h1>
                <p className={styles.description}>ETHOS is a basic full-stack chat application hosted on Render and serving as a portfolio project.  It is built with the following tech stack:</p>
                <ul className={styles.stackList}>
                    <li>
                        NextJS for the UI and the intermediate backend;
                    </li>
                    <li>
                        Express HTTP JSON API that sets cookie; 
                    </li>
                    <li>
                        Redis Cache hosted on Upstash (free tier) that holds user session data;
                    </li>
                    <li>
                        Postgres Database hosted on Neon (free tier);
                    </li>
                    <li>
                        Native WebSockets, tied to user session for authentication;
                    </li>
                </ul>
            </div>
        </div>
    )
}